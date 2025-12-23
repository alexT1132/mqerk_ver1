-- Agregar columna category a chat_messages para diferenciar entre soporte y académico
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS category VARCHAR(20) DEFAULT 'academic';

-- Actualizar índice para mejorar performance en queries de soporte
CREATE INDEX IF NOT EXISTS idx_chat_category ON chat_messages(category);
CREATE INDEX IF NOT EXISTS idx_chat_category_student ON chat_messages(category, student_id);
