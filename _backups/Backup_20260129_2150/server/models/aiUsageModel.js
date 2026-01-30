import pool from '../db.js';

/**
 * Modelo para gestionar el tracking de uso de análisis IA
 * Controla límites diarios por estudiante y tipo de análisis
 */
class AiUsageModel {
    /**
     * Obtener o crear registro de uso para hoy
     * @param {number} studentId - ID del estudiante
     * @param {string} type - Tipo de análisis ('simulacion' | 'quiz')
     * @returns {Promise<Object>} - { count, limit, remaining, date }
     */
    static async getOrCreateUsageToday(studentId, type) {
        const today = new Date().toISOString().split('T')[0];

        try {
            // Intentar obtener registro existente
            const [rows] = await pool.query(
                `SELECT * FROM ai_usage_tracking 
         WHERE id_estudiante = ? AND fecha = ? AND tipo = ?`,
                [studentId, today, type]
            );

            if (rows.length > 0) {
                const usage = rows[0];
                return {
                    count: usage.contador,
                    limit: usage.limite_diario,
                    remaining: Math.max(0, usage.limite_diario - usage.contador),
                    date: usage.fecha
                };
            }

            // Si no existe, crear nuevo registro con límite por defecto
            // TODO: Obtener límite según rol del estudiante
            const defaultLimit = 5; // Estudiantes regulares

            await pool.query(
                `INSERT INTO ai_usage_tracking (id_estudiante, fecha, tipo, contador, limite_diario) 
         VALUES (?, ?, ?, 0, ?)`,
                [studentId, today, type, defaultLimit]
            );

            return {
                count: 0,
                limit: defaultLimit,
                remaining: defaultLimit,
                date: today
            };
        } catch (error) {
            console.error('Error en getOrCreateUsageToday:', error);
            throw error;
        }
    }

    /**
     * Incrementar contador de uso
     * @param {number} studentId - ID del estudiante
     * @param {string} type - Tipo de análisis ('simulacion' | 'quiz')
     * @returns {Promise<Object>} - Nuevo estado del contador
     */
    static async incrementUsage(studentId, type) {
        const today = new Date().toISOString().split('T')[0];

        try {
            // Asegurar que existe el registro
            const currentUsage = await this.getOrCreateUsageToday(studentId, type);

            // Verificar límite antes de incrementar
            if (currentUsage.remaining <= 0) {
                throw new Error('LIMIT_REACHED');
            }

            // Incrementar contador
            await pool.query(
                `UPDATE ai_usage_tracking 
         SET contador = contador + 1 
         WHERE id_estudiante = ? AND fecha = ? AND tipo = ?`,
                [studentId, today, type]
            );

            // Retornar nuevo estado
            return await this.getOrCreateUsageToday(studentId, type);
        } catch (error) {
            console.error('Error en incrementUsage:', error);
            throw error;
        }
    }

    /**
     * Resetear contador (solo para testing/admin)
     * @param {number} studentId - ID del estudiante
     * @param {string} type - Tipo de análisis
     */
    static async resetUsage(studentId, type) {
        const today = new Date().toISOString().split('T')[0];

        try {
            await pool.query(
                `UPDATE ai_usage_tracking 
         SET contador = 0 
         WHERE id_estudiante = ? AND fecha = ? AND tipo = ?`,
                [studentId, today, type]
            );

            return await this.getOrCreateUsageToday(studentId, type);
        } catch (error) {
            console.error('Error en resetUsage:', error);
            throw error;
        }
    }

    /**
     * Limpiar registros antiguos (mantenimiento)
     * @param {number} daysToKeep - Días a mantener (default: 30)
     * @returns {Promise<number>} - Número de registros eliminados
     */
    static async cleanOldRecords(daysToKeep = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

        try {
            const [result] = await pool.query(
                `DELETE FROM ai_usage_tracking WHERE fecha < ?`,
                [cutoffDateStr]
            );

            console.log(`🧹 Limpieza de registros antiguos: ${result.affectedRows} eliminados`);
            return result.affectedRows;
        } catch (error) {
            console.error('Error en cleanOldRecords:', error);
            throw error;
        }
    }

    /**
     * Obtener estadísticas de uso por estudiante
     * @param {number} studentId - ID del estudiante
     * @param {number} days - Días a analizar (default: 7)
     */
    static async getUsageStats(studentId, days = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startDateStr = startDate.toISOString().split('T')[0];

        try {
            const [rows] = await pool.query(
                `SELECT fecha, tipo, contador, limite_diario
         FROM ai_usage_tracking
         WHERE id_estudiante = ? AND fecha >= ?
         ORDER BY fecha DESC`,
                [studentId, startDateStr]
            );

            return rows;
        } catch (error) {
            console.error('Error en getUsageStats:', error);
            throw error;
        }
    }
}

export default AiUsageModel;
