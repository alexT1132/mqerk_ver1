# 🔐 Configuración de Variables de Entorno - MQERK

## ⚠️ PROBLEMA DETECTADO

La API key de Gemini fue **bloqueada por Google** porque estaba expuesta públicamente en archivos de texto (`env.txt`, `ENV.txt`). 

**Error que estás viendo:**
```
Error: Your API key was reported as leaked. Please use another API key.
```

## ✅ SOLUCIÓN

### Paso 1: Obtener una Nueva API Key

1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Crea una **nueva API key**
4. **IMPORTANTE:** No compartas esta clave ni la subas a ningún repositorio

### Paso 2: Configurar Variables de Entorno en el Servidor

1. Ve a la carpeta `server/`
2. Copia el archivo `.env.example` a `.env`:
   ```bash
   cd server
   copy .env.example .env
   ```
3. Abre el archivo `.env` con un editor de texto
4. Reemplaza `tu_api_key_de_gemini_aqui` con tu nueva API key:
   ```
   GEMINI_API_KEY=tu_nueva_api_key_aqui
   ```
5. Completa también las otras variables (base de datos, JWT, etc.)

### Paso 3: Configurar Variables de Entorno en el Cliente

1. Ve a la carpeta `client/`
2. Copia el archivo `.env.example` a `.env`:
   ```bash
   cd client
   copy .env.example .env
   ```
3. Abre el archivo `.env` con un editor de texto
4. Reemplaza `tu_api_key_de_gemini_aqui` con tu nueva API key en ambas variables:
   ```
   VITE_GEMINI_QUIZ_API_KEY=tu_nueva_api_key_aqui
   VITE_GEMINI_API_KEY=tu_nueva_api_key_aqui
   ```

### Paso 4: Reiniciar los Servidores

Después de configurar las variables de entorno:

1. **Reinicia el servidor backend:**
   ```bash
   cd server
   npm run dev
   ```

2. **Reinicia el cliente frontend:**
   ```bash
   cd client
   npm run dev
   ```

## 📋 Variables de Entorno Requeridas

### Servidor (`server/.env`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `GEMINI_API_KEY` | API key de Google Gemini (obligatoria) | `AIzaSy...` |
| `DB_HOST` | Host de la base de datos | `localhost` |
| `DB_USER` | Usuario de la base de datos | `root` |
| `DB_PASSWORD` | Contraseña de la base de datos | `tu_password` |
| `DB_NAME` | Nombre de la base de datos | `mqerkacademy` |
| `JWT_SECRET` | Clave secreta para JWT | `clave_secreta_muy_larga` |
| `PORT` | Puerto del servidor | `1002` |

### Cliente (`client/.env`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_GEMINI_API_KEY` | API key para generación de preguntas | `AIzaSy...` |
| `VITE_GEMINI_QUIZ_API_KEY` | API key para análisis de quizzes | `AIzaSy...` |
| `VITE_API_URL` | URL del API backend | `http://localhost:1002/api` |

## 🔒 Seguridad

- ✅ **NUNCA** subas archivos `.env` al repositorio
- ✅ Los archivos `.env` están en `.gitignore` y no se subirán
- ✅ Usa archivos `.env.example` como plantillas (sin valores reales)
- ✅ Si expones una API key, revócala inmediatamente en Google AI Studio

## 🆘 Solución de Problemas

### Error 403: "Your API key was reported as leaked"
- **Causa:** La API key está expuesta públicamente
- **Solución:** Obtén una nueva API key y actualiza tus archivos `.env`

### Error: "GEMINI_API_KEY missing on server"
- **Causa:** El archivo `.env` no existe o la variable no está configurada
- **Solución:** Crea `server/.env` desde `server/.env.example` y completa la variable

### Error: "Failed to load resource: 403 (Forbidden)"
- **Causa:** API key inválida o bloqueada
- **Solución:** Verifica que la API key sea correcta y no esté bloqueada

## 📝 Notas

- Las variables de entorno del cliente deben empezar con `VITE_` para que Vite las exponga
- El servidor usa `dotenv` para cargar variables desde `.env`
- Reinicia los servidores después de cambiar las variables de entorno



