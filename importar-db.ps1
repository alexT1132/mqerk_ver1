# Script para importar la base de datos mqerkacademy en WampServer
# Ejecuta este script como Administrador

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  IMPORTADOR DE BASE DE DATOS MQERK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que WampServer esté corriendo
Write-Host "[1/5] Verificando WampServer..." -ForegroundColor Yellow
$wampProcess = Get-Process -Name "wampmanager" -ErrorAction SilentlyContinue
if (-not $wampProcess) {
    Write-Host "⚠️  ADVERTENCIA: No se detectó WampServer corriendo" -ForegroundColor Yellow
    Write-Host "   Asegúrate de que WampServer esté iniciado y MySQL esté corriendo" -ForegroundColor Yellow
    $continue = Read-Host "   ¿Continuar de todos modos? (s/n)"
    if ($continue -ne "s" -and $continue -ne "S") {
        Write-Host "❌ Operación cancelada" -ForegroundColor Red
        exit
    }
}

# Buscar la ruta de MySQL en WampServer
Write-Host "[2/5] Buscando instalación de MySQL..." -ForegroundColor Yellow
$possiblePaths = @(
    "C:\wamp64\bin\mysql\*\bin\mysql.exe",
    "C:\wamp\bin\mysql\*\bin\mysql.exe"
)

$mysqlPath = $null
foreach ($path in $possiblePaths) {
    $found = Get-ChildItem -Path $path -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
        $mysqlPath = $found.FullName
        Write-Host "✅ MySQL encontrado en: $mysqlPath" -ForegroundColor Green
        break
    }
}

if (-not $mysqlPath) {
    Write-Host "❌ No se encontró MySQL en las rutas comunes" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, proporciona la ruta manualmente:" -ForegroundColor Yellow
    Write-Host "Ejemplo: C:\wamp64\bin\mysql\mysql8.0.37\bin\mysql.exe" -ForegroundColor Gray
    $mysqlPath = Read-Host "Ruta de mysql.exe"
    
    if (-not (Test-Path $mysqlPath)) {
        Write-Host "❌ La ruta proporcionada no existe" -ForegroundColor Red
        exit
    }
}

# Verificar que el archivo SQL existe
Write-Host "[3/5] Verificando archivo SQL..." -ForegroundColor Yellow
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sqlFile = Join-Path $scriptDir "base de datos\mqerkacademy.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ No se encontró el archivo: $sqlFile" -ForegroundColor Red
    exit
}

$fileSize = (Get-Item $sqlFile).Length / 1MB
Write-Host "✅ Archivo encontrado: $sqlFile ($([math]::Round($fileSize, 2)) MB)" -ForegroundColor Green

# Solicitar contraseña de MySQL (si es necesario)
Write-Host "[4/5] Configurando conexión..." -ForegroundColor Yellow
$dbUser = "root"
$dbPassword = Read-Host "Contraseña de MySQL (root) [Enter si está vacía]"
if ([string]::IsNullOrWhiteSpace($dbPassword)) {
    $dbPassword = ""
    $passwordArg = ""
} else {
    $passwordArg = "-p$dbPassword"
}

# Crear la base de datos
Write-Host "[5/5] Importando base de datos..." -ForegroundColor Yellow
Write-Host "   Esto puede tardar varios minutos..." -ForegroundColor Gray
Write-Host ""

try {
    # Crear la base de datos si no existe
    Write-Host "   → Creando base de datos 'mqerkacademy'..." -ForegroundColor Cyan
    if ([string]::IsNullOrWhiteSpace($dbPassword)) {
        & $mysqlPath -u $dbUser -e "CREATE DATABASE IF NOT EXISTS mqerkacademy CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;" 2>&1 | Out-Null
    } else {
        & $mysqlPath -u $dbUser -p$dbPassword -e "CREATE DATABASE IF NOT EXISTS mqerkacademy CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;" 2>&1 | Out-Null
    }
    
    if ($LASTEXITCODE -ne 0) {
        throw "Error al crear la base de datos"
    }
    Write-Host "   ✅ Base de datos creada" -ForegroundColor Green
    
    # Importar el archivo SQL
    Write-Host "   → Importando tablas y datos..." -ForegroundColor Cyan
    if ([string]::IsNullOrWhiteSpace($dbPassword)) {
        Get-Content $sqlFile | & $mysqlPath -u $dbUser mqerkacademy 2>&1
    } else {
        Get-Content $sqlFile | & $mysqlPath -u $dbUser -p$dbPassword mqerkacademy 2>&1
    }
    
    if ($LASTEXITCODE -ne 0) {
        throw "Error al importar el archivo SQL"
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ IMPORTACIÓN COMPLETADA" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos pasos:" -ForegroundColor Cyan
    Write-Host "  1. Reinicia tu servidor Node.js" -ForegroundColor White
    Write-Host "  2. Verifica que no haya errores de conexión" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ ERROR durante la importación:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Sugerencias:" -ForegroundColor Yellow
    Write-Host "  - Verifica que MySQL esté corriendo en WampServer" -ForegroundColor White
    Write-Host "  - Verifica la contraseña de MySQL" -ForegroundColor White
    Write-Host "  - Intenta importar manualmente desde phpMyAdmin" -ForegroundColor White
    Write-Host ""
    exit 1
}

