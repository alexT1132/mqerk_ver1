import AiUsageModel from '../models/aiUsageModel.js';

/**
 * Controlador para gestionar el tracking de uso de análisis IA
 */
class AiUsageController {
    /**
     * GET /api/ai-usage/:studentId/:type
     * Obtener uso actual del día para un estudiante
     */
    static async getUsage(req, res) {
        try {
            const { studentId, type } = req.params;
            const userRole = req.user?.rol || req.user?.role; // Obtener el rol del usuario autenticado

            // Validar tipo
            if (!['simulacion', 'quiz', 'tutor'].includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Tipo inválido. Debe ser "simulacion", "quiz" o "tutor"'
                });
            }

            // Validar que el estudiante existe
            if (!studentId || isNaN(studentId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de estudiante inválido'
                });
            }

            const usage = await AiUsageModel.getOrCreateUsageToday(studentId, type, userRole);

            res.json({
                success: true,
                data: usage
            });
        } catch (error) {
            console.error('❌ Error en getUsage:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener uso de IA',
                error: error.message
            });
        }
    }

    /**
     * POST /api/ai-usage/:studentId/:type/increment
     * Incrementar contador de uso
     */
    static async incrementUsage(req, res) {
        try {
            const { studentId, type } = req.params;

            // Validar tipo
            if (!['simulacion', 'quiz', 'tutor'].includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Tipo inválido. Debe ser "simulacion", "quiz" o "tutor"'
                });
            }

            // Validar estudiante
            if (!studentId || isNaN(studentId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de estudiante inválido'
                });
            }

            // Verificar límite antes de incrementar
            const currentUsage = await AiUsageModel.getOrCreateUsageToday(studentId, type);
            if (currentUsage.remaining <= 0) {
                return res.status(429).json({
                    success: false,
                    message: 'Límite diario de análisis alcanzado',
                    data: currentUsage
                });
            }

            // Incrementar contador
            const newUsage = await AiUsageModel.incrementUsage(studentId, type);

            console.log(`✅ Uso de IA incrementado - Estudiante: ${studentId}, Tipo: ${type}, Restantes: ${newUsage.remaining}`);

            res.json({
                success: true,
                data: newUsage,
                message: 'Uso incrementado correctamente'
            });
        } catch (error) {
            // Manejar error de límite alcanzado
            if (error.message === 'LIMIT_REACHED') {
                const currentUsage = await AiUsageModel.getOrCreateUsageToday(req.params.studentId, req.params.type);
                return res.status(429).json({
                    success: false,
                    message: 'Límite diario de análisis alcanzado',
                    data: currentUsage
                });
            }

            console.error('❌ Error en incrementUsage:', error);
            res.status(500).json({
                success: false,
                message: 'Error al incrementar uso de IA',
                error: error.message
            });
        }
    }

    /**
     * POST /api/ai-usage/:studentId/:type/reset
     * Resetear contador (solo para admin/testing)
     */
    static async resetUsage(req, res) {
        try {
            const { studentId, type } = req.params;

            // TODO: Verificar que el usuario es admin
            // if (req.user.role !== 'admin') {
            //   return res.status(403).json({ success: false, message: 'No autorizado' });
            // }

            const usage = await AiUsageModel.resetUsage(studentId, type);

            console.log(`🔄 Contador reseteado - Estudiante: ${studentId}, Tipo: ${type}`);

            res.json({
                success: true,
                data: usage,
                message: 'Contador reseteado correctamente'
            });
        } catch (error) {
            console.error('❌ Error en resetUsage:', error);
            res.status(500).json({
                success: false,
                message: 'Error al resetear contador',
                error: error.message
            });
        }
    }

    /**
     * GET /api/ai-usage/:studentId/stats
     * Obtener estadísticas de uso
     */
    static async getStats(req, res) {
        try {
            const { studentId } = req.params;
            const days = parseInt(req.query.days) || 7;

            const stats = await AiUsageModel.getUsageStats(studentId, days);

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('❌ Error en getStats:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas',
                error: error.message
            });
        }
    }
}

export default AiUsageController;
