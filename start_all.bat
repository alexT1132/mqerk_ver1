@echo off
REM Inicia backend y frontend (dev) con un solo doble clic.
REM Auto-instala dependencias si faltan node_modules.

setlocal ENABLEDELAYEDEXPANSION

REM Ruta raiz (carpeta donde está este .bat)
for %%I in ("%~dp0.") do set ROOT=%%~fI

echo ==============================================
echo   MQERK - Lanzando Backend y Frontend (dev)
echo   Root: %ROOT%
echo ==============================================

REM Verificar Node
where node >nul 2>&1
if errorlevel 1 (
	echo [ERROR] Node.js no esta instalado o no esta en PATH.
	echo Instala Node.js desde https://nodejs.org/ y vuelve a intentar.
	pause
	goto :eof
)

call :startService "Backend" "server" "npm run dev"
call :startService "Frontend" "client" "npm run dev"

REM Detectar puerto FRONTEND desde vite.config.js (fallback 5173)
set VITE_PORT=
for /f %%P in ('powershell -NoLogo -NoProfile -Command "(Get-Content '%ROOT%\client\vite.config.js') -match 'port:' ^| Select-Object -First 1 ^| ForEach-Object { ($_ -replace '[^0-9]','') }"') do set VITE_PORT=%%P
if not defined VITE_PORT set VITE_PORT=5173

REM Detectar puerto BACKEND desde server/index.js (buscar const PORT = ####)
set API_PORT=
for /f %%P in ('powershell -NoLogo -NoProfile -Command "(Get-Content '%ROOT%\server\index.js') -match 'PORT = ' ^| Select-Object -First 1 ^| ForEach-Object { ($_ -replace '[^0-9]','') }"') do set API_PORT=%%P
if not defined API_PORT set API_PORT=1002

set FRONTEND_URL=http://localhost:%VITE_PORT%
set BACKEND_URL=http://localhost:%API_PORT%

echo Frontend port detectado: %VITE_PORT%
echo Backend  port detectado: %API_PORT%
echo Abriendo navegador (frontend) en 3s...
start "Abrir Navegador" powershell -NoLogo -NoProfile -Command "Start-Sleep -Seconds 3; Start-Process '%FRONTEND_URL%'"

echo.
echo Servicios iniciados en ventanas separadas.
echo Backend: ventana "Backend"  - Frontend: ventana "Frontend".
echo Cierra cada ventana para detener ese servicio.
echo.
pause
goto :eof

:startService
REM %1 = Nombre (titulo ventana)
REM %2 = Subcarpeta
REM %3 = Comando (script npm)
set NAME=%~1
set DIR=%~2
set CMD=%~3
echo [%NAME%] Preparando...
if not exist "%ROOT%\%DIR%\package.json" (
	echo [%NAME%] ERROR: No se encontro package.json en "%ROOT%\%DIR%".
	goto :eof
)

if not exist "%ROOT%\%DIR%\node_modules" (
	echo [%NAME%] Instalando dependencias (npm install)...
	pushd "%ROOT%\%DIR%"
	call npm install
	if errorlevel 1 (
		echo [%NAME%] ERROR en npm install.
		popd
		goto :eof
	)
	popd
)

echo [%NAME%] Iniciando: %CMD%
start "%NAME%" cmd /k "cd /d \"%ROOT%\%DIR%\" && %CMD%"
goto :eof

