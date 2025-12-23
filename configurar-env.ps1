# Script para configurar variables de entorno - MQERK
# Ejecuta este script desde la raiz del proyecto

Write-Host "Configuracion de Variables de Entorno - MQERK" -ForegroundColor Cyan
Write-Host ""

# Verificar si los archivos .env ya existen
$serverEnvExists = Test-Path "server\.env"
$clientEnvExists = Test-Path "client\.env"

if ($serverEnvExists) {
    Write-Host "ADVERTENCIA: El archivo server\.env ya existe" -ForegroundColor Yellow
    $overwrite = Read-Host "Deseas sobrescribirlo? (s/n)"
    if ($overwrite -ne "s" -and $overwrite -ne "S") {
        Write-Host "Operacion cancelada para server\.env" -ForegroundColor Red
        $serverEnvExists = $true
    } else {
        $serverEnvExists = $false
    }
}

if ($clientEnvExists) {
    Write-Host "ADVERTENCIA: El archivo client\.env ya existe" -ForegroundColor Yellow
    $overwrite = Read-Host "Deseas sobrescribirlo? (s/n)"
    if ($overwrite -ne "s" -and $overwrite -ne "S") {
        Write-Host "Operacion cancelada para client\.env" -ForegroundColor Red
        $clientEnvExists = $true
    } else {
        $clientEnvExists = $false
    }
}

# Crear archivo .env del servidor
if (-not $serverEnvExists) {
    Write-Host ""
    Write-Host "Configurando server\.env..." -ForegroundColor Green
    
    $content = @"
# Configuracion del servidor MQERK
# IMPORTANTE: Completa con tus valores reales

# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=mqerkacademy
DB_PORT=3306

# JWT
JWT_SECRET=

# Puerto del servidor
PORT=1002

# CORS (solo true en desarrollo, false en produccion)
ALLOW_ALL_CORS=true

# Google Gemini API
# IMPORTANTE: Obten una nueva API key en: https://aistudio.google.com/app/apikey
# La API key anterior fue bloqueada por estar expuesta publicamente
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash

# Host (opcional, para produccion)
# HOST=0.0.0.0
"@
    
    $content | Out-File -FilePath "server\.env" -Encoding UTF8 -NoNewline
    Write-Host "Archivo server\.env creado" -ForegroundColor Green
    Write-Host "Completa las variables: DB_PASSWORD, JWT_SECRET, GEMINI_API_KEY" -ForegroundColor Yellow
}

# Crear archivo .env del cliente
if (-not $clientEnvExists) {
    Write-Host ""
    Write-Host "Configurando client\.env..." -ForegroundColor Green
    
    $content = @"
# Configuracion del cliente MQERK (Frontend)
# Variables de entorno para Vite - todas deben empezar con VITE_

# URL del API Backend
VITE_API_URL=http://localhost:1002/api

# Google Gemini API - Para analisis de quizzes
# IMPORTANTE: Obten una nueva API key en: https://aistudio.google.com/app/apikey
# La API key anterior fue bloqueada por estar expuesta publicamente
VITE_GEMINI_QUIZ_API_KEY=
VITE_GEMINI_QUIZ_MODEL=gemini-2.0-flash
VITE_GEMINI_QUIZ_API_VERSION=v1beta

# Google Gemini API - Para otros servicios (generacion de preguntas, simuladores, etc.)
# IMPORTANTE: Obten una nueva API key en: https://aistudio.google.com/app/apikey
# La API key anterior fue bloqueada por estar expuesta publicamente
VITE_GEMINI_API_KEY=
VITE_GEMINI_MODEL=gemini-2.0-flash

# Limite maximo de preguntas generadas por IA
VITE_AI_MAX_QUESTIONS=50

# Cooldown para evitar limites de la API (en milisegundos)
VITE_IA_COOLDOWN_MS=45000
"@
    
    $content | Out-File -FilePath "client\.env" -Encoding UTF8 -NoNewline
    Write-Host "Archivo client\.env creado" -ForegroundColor Green
    Write-Host "Completa las variables: VITE_GEMINI_API_KEY, VITE_GEMINI_QUIZ_API_KEY" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Configuracion completada!" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Obten una nueva API key en: https://aistudio.google.com/app/apikey" -ForegroundColor White
Write-Host "   2. Edita server\.env y completa GEMINI_API_KEY" -ForegroundColor White
Write-Host "   3. Edita client\.env y completa VITE_GEMINI_API_KEY y VITE_GEMINI_QUIZ_API_KEY" -ForegroundColor White
Write-Host "   4. Reinicia los servidores (npm run dev)" -ForegroundColor White
Write-Host ""
Write-Host "Para mas informacion, consulta: CONFIGURACION_VARIABLES_ENTORNO.md" -ForegroundColor Cyan
