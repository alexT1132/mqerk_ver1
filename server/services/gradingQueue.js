/**
 * Sistema de cola simple para calificación en segundo plano
 * Mantiene una cola en memoria de respuestas pendientes de calificar
 */

class GradingQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
        this.maxConcurrent = 5; // Máximo de respuestas procesando simultáneamente
        this.currentlyProcessing = 0;
    }

    /**
     * Agrega una respuesta a la cola de calificación
     */
    add(item) {
        // Validar que tenga los campos necesarios
        if (!item.id_respuesta || !item.tipo || !item.pregunta || !item.respuesta_esperada || !item.respuesta_estudiante) {
            console.error('[GradingQueue] Item inválido, faltan campos requeridos:', item);
            return false;
        }

        // Evitar duplicados (misma respuesta ya en cola)
        const exists = this.queue.some(q =>
            q.id_respuesta === item.id_respuesta && q.tipo === item.tipo
        );

        if (exists) {
            console.log('[GradingQueue] Respuesta ya en cola, ignorando duplicado:', item.id_respuesta);
            return false;
        }

        this.queue.push({
            ...item,
            addedAt: Date.now()
        });

        console.log(`[GradingQueue] ✅ Agregado a cola: ${item.tipo} #${item.id_respuesta} (Total en cola: ${this.queue.length})`);

        // Iniciar procesamiento si no está corriendo
        if (!this.processing) {
            this.startProcessing();
        }

        return true;
    }

    /**
     * Inicia el procesamiento de la cola
     */
    startProcessing() {
        if (this.processing) return;

        this.processing = true;
        console.log('[GradingQueue] 🚀 Iniciando procesamiento de cola');

        // Procesar cada 2 segundos
        this.processInterval = setInterval(() => {
            this.processNext();
        }, 2000);
    }

    /**
     * Detiene el procesamiento de la cola
     */
    stopProcessing() {
        if (this.processInterval) {
            clearInterval(this.processInterval);
            this.processInterval = null;
        }
        this.processing = false;
        console.log('[GradingQueue] ⏸️ Procesamiento detenido');
    }

    /**
     * Procesa el siguiente lote de respuestas
     */
    async processNext() {
        // Si no hay nada en cola o ya estamos procesando el máximo, esperar
        if (this.queue.length === 0) {
            // Si la cola está vacía, detener el procesamiento
            if (this.currentlyProcessing === 0) {
                this.stopProcessing();
            }
            return;
        }

        // Calcular cuántas podemos procesar
        const available = this.maxConcurrent - this.currentlyProcessing;
        if (available <= 0) {
            return; // Ya estamos procesando el máximo
        }

        // Tomar las siguientes respuestas a procesar
        const batch = this.queue.splice(0, available);

        console.log(`[GradingQueue] 📝 Procesando lote de ${batch.length} respuestas (${this.queue.length} restantes en cola)`);

        // Procesar cada una en paralelo
        batch.forEach(item => {
            this.currentlyProcessing++;
            this.processItem(item)
                .then(() => {
                    console.log(`[GradingQueue] ✅ Procesado: ${item.tipo} #${item.id_respuesta}`);
                })
                .catch(err => {
                    console.error(`[GradingQueue] ❌ Error procesando ${item.tipo} #${item.id_respuesta}:`, err.message);
                })
                .finally(() => {
                    this.currentlyProcessing--;
                });
        });
    }

    /**
     * Procesa un item individual
     * Esta función será implementada por el backgroundGrader
     */
    async processItem(item) {
        // Importar dinámicamente para evitar dependencias circulares
        const { processShortAnswer } = await import('./backgroundGrader.js');
        return processShortAnswer(item);
    }

    /**
     * Obtiene el estado actual de la cola
     */
    getStatus() {
        return {
            queueLength: this.queue.length,
            processing: this.processing,
            currentlyProcessing: this.currentlyProcessing,
            maxConcurrent: this.maxConcurrent
        };
    }

    /**
     * Limpia la cola (útil para testing)
     */
    clear() {
        this.queue = [];
        this.currentlyProcessing = 0;
        console.log('[GradingQueue] 🗑️ Cola limpiada');
    }
}

// Instancia global singleton
const gradingQueue = new GradingQueue();

export default gradingQueue;
