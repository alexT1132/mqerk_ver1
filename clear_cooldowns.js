// SCRIPT PARA LIMPIAR COOLDOWNS Y CONTADORES DE 429
// Ejecuta esto en la consola del navegador (F12 -> Console)

console.log('🧹 Limpiando cooldowns y contadores de IA...');

// Limpiar todas las keys relacionadas con cooldowns de IA
const keysToRemove = [
    'ia_cooldown_until',
    'ia_cooldown_429_count',
    'ia_last_429_time',
    'ai_recent_requests',
    'ai_questions_usage'
];

keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
        console.log(`❌ Eliminando: ${key} = ${localStorage.getItem(key)}`);
        localStorage.removeItem(key);
    }
});

console.log('✅ Cooldowns limpiados. Recarga la página (F5) para aplicar cambios.');
