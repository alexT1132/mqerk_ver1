@echo off
:: ==========================================
:: 1. SETUP INICIAL
:: ==========================================
cd /d "%~dp0"
setlocal enabledelayedexpansion
chcp 65001 >nul
title MQERK - UNLOCKED EDITION v16.3 (FIXED)
color 0B

:: --- CONFIGURACIÓN ---
set "SERVER_PORT=1002"
set "CLIENT_PORT=5173"
set "SERVER_DIR=server"
set "CLIENT_DIR=client"
set "URL_CLIENT=http://localhost:%CLIENT_PORT%"
set "LOG_MODE=OFF"

:: --- PERMISOS ADMIN ---
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo ⚡ Solicitando permisos de Administrador...
    powershell -Command "Start-Process '%~0' -Verb RunAs"
    exit /b
)
cd /d "%~dp0"

:MAIN_MENU
:: ==========================================
:: 2. DASHBOARD
:: ==========================================
:: IP Local
set "LOCAL_IP=..."
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4" ^| findstr /v "127.0.0.1"') do set "LOCAL_IP=%%a"
set "LOCAL_IP=!LOCAL_IP: =!"

:: Estado Git
for /f "delims=" %%i in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set GIT_BRANCH=%%i
if not defined GIT_BRANCH set GIT_BRANCH=OFFLINE
git diff --quiet >nul 2>&1
if %errorlevel% neq 0 (set "GIT_STATUS=⚠️ Cambios sin guardar") else (set "GIT_STATUS=✅ Todo limpio")

:: Estado Logs
if "%LOG_MODE%"=="ON" (set "LOG_ICON=🔴 GRABANDO") else (set "LOG_ICON=⚪ OFF")

cls
echo.
echo  ███╗   ███╗ ██████╗ ███████╗██████╗ ██╗  ██╗ COMMAND CENTER
echo  ████╗ ████║██╔═══██╗██╔════╝██╔══██╗██║ ██╔╝ v16.3 FIXED
echo  ██╔████╔██║██║   ██║█████╗  ██████╔╝█████╔╝ 
echo  ██║╚██╔╝██║██║▄▄ ██║██╔══╝  ██╔══██╗██╔═██╗ 
echo  ██║ ╚═╝ ██║╚██████╔╝███████╗██║  ██║██║  ██╗
echo  ╚═╝     ╚═╝ ╚══▀▀═╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
echo ══════════════════════════════════════════════════════════════════
echo  📊 DASHBOARD:
echo  📡 IP Local:   !LOCAL_IP!      (Accesible en misma Wi-Fi)
echo  🐙 Git Rama:   !GIT_BRANCH!          (!GIT_STATUS!)
echo  📼 Caja Negra: !LOG_ICON!        (Logs Persistentes)
echo ══════════════════════════════════════════════════════════════════
echo.

echo  [ 🚀 FLUJO DIARIO ]             [ ✨ INTELIGENCIA ]
echo  1.  ⚡ INICIAR SERVICIOS         4.  🏗️  THE ARCHITECT (React Gen)
echo  2.  💻 ABRIR EDITOR (VS Code)    5.  🧠 JARVIS INSIGHTS (Analisis)
echo  3.  🛑 DETENER TODO              6.  📦 NPM WIZARD (Instalar)
echo                                   17. ⚡ THE INTERCEPTOR (API Test)

echo.
echo  [ 🐙 GIT MASTER ]               [ 🌍 CONECTIVIDAD ]
echo  7.  🌲 BRANCH MANAGER (Ramas)    11. 🌍 MODO INTERNET (Tunnel)
echo  8.  📤 PUSH RÁPIDO               12. 🔐 GENERAR TOKEN
echo  9.  📥 PULL                      16. 📱 THE PORTAL (QR Code)
echo  10. 🕒 TIME MACHINE (Reset)      
echo                                   [ 🛡️ MANTENIMIENTO ]
echo                                   13. 💾 BACKUP PROYECTO
echo                                   14. ☢️  HARD RESET
echo                                   15. 📼 BLACK BOX RECORDER (On/Off)
echo.

echo  0.  Salir
echo.
set /p option="👉 Comandante, ordene: "

:: RUTEO DE OPCIONES
if "%option%"=="1" goto START_ALL
if "%option%"=="2" goto OPEN_EDITOR
if "%option%"=="3" goto STOP_ALL
if "%option%"=="4" goto THE_ARCHITECT
if "%option%"=="5" goto JARVIS_INSIGHTS
if "%option%"=="6" goto NPM_WIZARD
if "%option%"=="7" goto GIT_BRANCH_MANAGER
if "%option%"=="8" goto GIT_PUSH
if "%option%"=="9" goto GIT_PULL
if "%option%"=="10" goto TIME_MACHINE
if "%option%"=="11" goto EXPOSE_WEB
if "%option%"=="12" goto GENERATE_TOKEN
if "%option%"=="13" goto BACKUP_PROJECT
if "%option%"=="14" goto HARD_RESET
if "%option%"=="15" goto TOGGLE_LOGS
if "%option%"=="16" goto QR_PORTAL
if "%option%"=="17" goto API_TESTER
if "%option%"=="0" goto END
goto MAIN_MENU

:: ==========================================
:: SECCIÓN 1: FLUJO DIARIO (MODIFICADO --HOST)
:: ==========================================
:START_ALL
call :CHECK_DEPS
call :STOP_SILENT
echo 🚀 Despegando (Abriendo red local)...

:: Preparar Timestamp para logs
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set "TS=%datetime:~0,8%_%datetime:~8,6%"
if not exist "_logs" mkdir "_logs"

:: AQUI ESTA LA MAGIA: Agregue " -- --host" para permitir conexiones del celular
if "%LOG_MODE%"=="ON" (
    echo 🔴 MODO CAJA NEGRA ACTIVO: Output redirigido a _logs/
    
    start "MQERK Server (REC)" cmd /k "title MQERK Server (REC) & color 4F & cd /d %~dp0%SERVER_DIR% & echo [REC] Grabando log... & npm run dev -- --host >> %~dp0_logs\server_%TS%.log 2>&1"
    
    start "MQERK Client (REC)" cmd /k "title MQERK Client (REC) & color 4F & cd /d %~dp0%CLIENT_DIR% & echo [REC] Grabando log... & npm run dev -- --host >> %~dp0_logs\client_%TS%.log 2>&1"
) else (
    start "MQERK Server" cmd /k "title MQERK Server & color 0A & cd /d %~dp0%SERVER_DIR% & npm run dev -- --host"
    start "MQERK Client" cmd /k "title MQERK Client & color 0B & cd /d %~dp0%CLIENT_DIR% & npm run dev -- --host"
)

timeout /t 5 /nobreak >nul
start %URL_CLIENT%
goto MAIN_MENU

:TOGGLE_LOGS
if "%LOG_MODE%"=="OFF" (
    set "LOG_MODE=ON"
) else (
    set "LOG_MODE=OFF"
)
goto MAIN_MENU

:OPEN_EDITOR
echo 💻 Abriendo VS Code...
code .
echo 📂 Abriendo explorador...
start "" "%~dp0"
goto MAIN_MENU

:STOP_ALL
call :STOP_SILENT
goto MAIN_MENU

:: ==========================================
:: SECCIÓN 2: AUTOMATIZACIÓN
:: ==========================================
:THE_ARCHITECT
cls
echo ══════════════════════════════════════════
echo  🏗️  THE ARCHITECT (React Generator)
echo ══════════════════════════════════════════
echo.
echo Creará Carpeta + JSX + CSS automáticamente.
set /p compName="> Nombre del Componente (ej: Navbar): "
set "COMP_PATH=%~dp0%CLIENT_DIR%\src\components\%compName%"

if exist "%COMP_PATH%" ( echo ❌ Ya existe. & pause & goto MAIN_MENU )
mkdir "%COMP_PATH%"

(
echo import React from 'react'
echo import './%compName%.css'
echo.
echo const %compName% = ^(^) =^> {
echo   return ^(
echo     ^<div className="%compName%"^>
echo       ^<h1^>%compName% Works!^</h1^>
echo     ^</div^>
echo   ^)
echo }
echo.
echo export default %compName%
) > "%COMP_PATH%\%compName%.jsx"

(
echo .%compName% {
echo   background-color: #f0f0f0;
echo   padding: 20px;
echo }
) > "%COMP_PATH%\%compName%.css"

echo ✅ Componente creado en src/components/%compName%
pause
goto MAIN_MENU

:JARVIS_INSIGHTS
cls
echo ══════════════════════════════════════════
echo  🧠 JARVIS INSIGHTS (Analisis de Codigo)
echo ══════════════════════════════════════════
echo.
echo  [1/2] 🗺️  MAPEANDO RUTAS DE API (Backend)...
echo  ------------------------------------------------
findstr /S /I /C:"app.get" /C:"app.post" /C:"app.put" /C:"app.delete" /C:"router.get" /C:"router.post" "%~dp0%SERVER_DIR%\*.js"
echo.
echo.
echo  [2/2] 🕵️  BUSCANDO TAREAS PENDIENTES (TODOs)...
echo  ------------------------------------------------
findstr /S /I /C:"// TODO" /C:"// FIXME" "%~dp0*.js" "%~dp0*.jsx"
echo.
echo ══════════════════════════════════════════
echo  Reporte finalizado.
pause
goto MAIN_MENU

:API_TESTER
cls
echo ══════════════════════════════════════════
echo  ⚡ THE INTERCEPTOR (API Tester)
echo ══════════════════════════════════════════
echo.
echo  Prueba tus endpoints del Server (%SERVER_PORT%) aqui mismo.
echo  Ejemplo: /api/users o /api/status
echo.
set /p endpoint="> Endpoint: "
echo.
echo  Enviando peticion GET a http://localhost:%SERVER_PORT%%endpoint% ...
echo  -----------------------------------------------------------
curl -s http://localhost:%SERVER_PORT%%endpoint%
echo.
echo  -----------------------------------------------------------
echo.
pause
goto MAIN_MENU

:NPM_WIZARD
cls
echo 📦 ASISTENTE DE INSTALACIÓN
echo [1] Server [2] Client
set /p d="> "
if "%d%"=="1" set "T=%SERVER_DIR%"
if "%d%"=="2" set "T=%CLIENT_DIR%"
set /p p="> Nombre del paquete (ej: axios): "
cd /d "%~dp0%T%" & npm install %p% & cd /d "%~dp0"
pause
goto MAIN_MENU

:: ==========================================
:: SECCIÓN 3: GIT MASTER
:: ==========================================
:GIT_BRANCH_MANAGER
cls
echo 🌲 GESTOR DE RAMAS
git branch
echo [1] Checkout [2] New Branch [V] Volver
set /p o="> "
if "%o%"=="1" set /p b="Nombre rama: " & git checkout !b!
if "%o%"=="2" set /p b="Nueva rama: " & git checkout -b !b!
pause
goto MAIN_MENU

:GIT_PUSH
:: --- ESTA SECCION FUE REPARADA PARA EVITAR EL ERROR DE COMMIT VACIO ---
cls
echo 📤 SUBIDA INTELIGENTE A GIT
git status -s
echo.
set /p msg="> Mensaje del commit: "
if "%msg%"=="" set msg=Update %date%

echo.
echo [1/3] Adding...
git add .
echo [2/3] Committing...
git commit -m "%msg%"
echo [3/3] Pushing...
:: El flag -u conecta la rama si es nueva
git push -u origin HEAD

if %errorlevel% neq 0 ( echo ❌ Error al subir. ) else ( echo ✅ Exito. )
pause
goto MAIN_MENU

:GIT_PULL
git pull & pause & goto MAIN_MENU

:TIME_MACHINE
cls
color 5E
echo 🕒 TIME MACHINE (Volver al pasado)
git log --oneline -n 5
echo Escribe el ID del commit o V para volver.
set /p commitID="> "
if /i "%commitID%"=="V" ( color 0B & goto MAIN_MENU )
git reset --hard %commitID%
echo ✅ Viaje temporal completado.
pause
color 0B
goto MAIN_MENU

:: ==========================================
:: SECCIÓN 4: CONECTIVIDAD Y UTILS
:: ==========================================
:QR_PORTAL
cls
echo ══════════════════════════════════════════
echo  📱 THE PORTAL (QR CONNECT)
echo ══════════════════════════════════════════
echo.
echo  Escanea este codigo con tu celular para
echo  conectar instantaneamente a:
echo  http://!LOCAL_IP!:%CLIENT_PORT%
echo.
echo  (Asegurate de que tu celular este en el Wi-Fi)
echo  (Si no conecta, revisa tu Firewall de Windows)
echo.
curl -s "https://qrcode.show/http://!LOCAL_IP!:%CLIENT_PORT!"
echo.
echo.
pause
goto MAIN_MENU

:EXPOSE_WEB
cls
echo 🌍 MODO INTERNET
echo Usa la IP publica: & curl -s https://loca.lt/mytunnelpassword
echo Presiona tecla para abrir tunel...
pause >nul
start "TUNNEL" cmd /k "npx localtunnel --port %CLIENT_PORT%"
goto MAIN_MENU

:GENERATE_TOKEN
powershell -Command "[Convert]::ToBase64String((1..48|%%{ [byte](Get-Random -Max 256) }))" & pause & goto MAIN_MENU

:BACKUP_PROJECT
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set "TS=%datetime:~0,8%_%datetime:~8,4%"
robocopy . "_backups\Backup_%TS%" /MIR /XD node_modules .git dist build _backups /XF *.log /NJH /NJS /NDL /NC /NS
echo ✅ Backup guardado en _backups\Backup_%TS%
pause
goto MAIN_MENU

:HARD_RESET
cls
color 4F
set /p c="⚠️ REINSTALAR TODO? (SI/NO): "
if /i not "%c%"=="SI" ( color 0B & goto MAIN_MENU )
call :STOP_SILENT
color 0E
if exist "%~dp0%SERVER_DIR%\node_modules" rmdir /s /q "%~dp0%SERVER_DIR%\node_modules"
if exist "%~dp0%SERVER_DIR%\package-lock.json" del "%~dp0%SERVER_DIR%\package-lock.json"
if exist "%~dp0%CLIENT_DIR%\node_modules" rmdir /s /q "%~dp0%CLIENT_DIR%\node_modules"
if exist "%~dp0%CLIENT_DIR%\package-lock.json" del "%~dp0%CLIENT_DIR%\package-lock.json"
cd /d "%~dp0%SERVER_DIR%" & call npm install
cd /d "%~dp0%CLIENT_DIR%" & call npm install
cd /d "%~dp0"
color 0B
pause
goto MAIN_MENU

:: ==========================================
:: FUNCIONES INTERNAS
:: ==========================================
:STOP_SILENT
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM nodemon.exe >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%SERVER_PORT% ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%CLIENT_PORT% ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
goto :eof

:CHECK_DEPS
if not exist "%~dp0%SERVER_DIR%\node_modules" ( cd /d "%~dp0%SERVER_DIR%" & call npm install & cd /d "%~dp0" )
if not exist "%~dp0%CLIENT_DIR%\node_modules" ( cd /d "%~dp0%CLIENT_DIR%" & call npm install & cd /d "%~dp0" )
goto :eof

:END
exit