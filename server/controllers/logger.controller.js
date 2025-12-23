import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_FILE = path.join(__dirname, '..', 'log_error.txt');

// Función helper para escribir en el archivo de log
const writeLog = async (message) => {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    // Usar appendFile para agregar al final del archivo
    await fs.appendFile(LOG_FILE, logEntry, 'utf8');
  } catch (error) {
    // Si falla escribir en el archivo, al menos loguear en consola
    console.error('[Logger] Error escribiendo en log_error.txt:', error);
  }
};

// Endpoint para recibir logs del cliente
export const logError = async (req, res) => {
  try {
    const { level = 'info', component, message, data } = req.body;
    
    // Formatear el mensaje
    let logMessage = `[${level.toUpperCase()}]`;
    if (component) {
      logMessage += ` [${component}]`;
    }
    if (message) {
      logMessage += ` ${message}`;
    }
    if (data) {
      // Convertir objetos a string de forma legible
      try {
        const dataStr = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
        logMessage += `\n${dataStr}`;
      } catch (e) {
        logMessage += `\n${String(data)}`;
      }
    }
    
    // Escribir en el archivo
    await writeLog(logMessage);
    
    // También loguear en consola para desarrollo
    if (level === 'error') {
      console.error(`[${component || 'CLIENT'}]`, message, data);
    } else {
      console.log(`[${component || 'CLIENT'}]`, message, data);
    }
    
    res.json({ success: true, message: 'Log guardado' });
  } catch (error) {
    console.error('[Logger] Error en logError:', error);
    res.status(500).json({ success: false, message: 'Error guardando log' });
  }
};

// Endpoint para limpiar el archivo de log (útil para desarrollo)
export const clearLog = async (req, res) => {
  try {
    await fs.writeFile(LOG_FILE, '', 'utf8');
    res.json({ success: true, message: 'Log limpiado' });
  } catch (error) {
    console.error('[Logger] Error limpiando log:', error);
    res.status(500).json({ success: false, message: 'Error limpiando log' });
  }
};

// Endpoint para leer el archivo de log
export const getLog = async (req, res) => {
  try {
    const content = await fs.readFile(LOG_FILE, 'utf8');
    res.json({ success: true, content });
  } catch (error) {
    if (error.code === 'ENOENT') {
      // El archivo no existe, devolver vacío
      res.json({ success: true, content: '' });
    } else {
      console.error('[Logger] Error leyendo log:', error);
      res.status(500).json({ success: false, message: 'Error leyendo log' });
    }
  }
};

