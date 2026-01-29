@echo off
:: ==========================================
:: 1. SETUP INICIAL
:: ==========================================
cd /d "%~dp0"
setlocal enabledelayedexpansion
chcp 65001 >nul
title MQERK - FREEDOM EDITION v17.3 (ANTI-CRASH)
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
set "GIT_BRANCH="
for /f "delims=" %%i in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set "GIT_BRANCH=%%i"

if not defined GIT_BRANCH (
    set "GIT_BRANCH=SIN GIT"
    set "GIT_STATUS=❓ Sin repositorio"
) else (
    git diff --quiet >nul 2>&1
    if !errorlevel! neq 0 (set "GIT_STATUS=⚠️ Cambios sin guardar") else (set "GIT_STATUS=✅ Todo limpio")
)

:: Estado Logs
if "%LOG_MODE%"=="ON" (set "LOG_ICON=🔴 GRABANDO") else (set "LOG_ICON=⚪ OFF")

cls
echo.
echo  ███╗   ███╗ ██████╗ ███████╗██████╗ ██╗  ██╗ COMMAND CENTER
echo  ████╗ ████║██╔═══██╗██╔════╝██╔══██╗██║ ██╔╝ v17.3 STABLE
echo  ██╔████╔██║██║   ██║█████╗  ██████╔╝█████╔╝ 
echo  ██║╚██╔╝██║██║▄▄ ██║██╔══╝  ██╔══██╗██╔═██╗ 
echo  ██║ ╚═╝ ██║╚██████╔╝███████╗██║  ██║██║  ██╗
echo  ╚═╝     ╚═╝ ╚══▀▀═╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
echo ══════════════════════════════════════════════════════════════════
echo  📊 DASHBOARD:
echo  📡 IP Local:   !LOCAL_IP!      (Accesible en misma Wi-Fi)
echo  🐙 Git Rama:   !GIT_BRANCH!           (!GIT_STATUS!)
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
echo  18. 🔗 GIT REMOTE (Crear/Cambiar Repo)
echo.
echo  [ 🛡️ MANTENIMIENTO ]
echo  13. 💾 BACKUP PROYECTO
echo  14. ☢️  HARD RESET
echo  15. 📼 BLACK BOX RECORDER (On/Off)
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
if "%option%"=="18" goto GIT_REMOTE_MANAGER
if "%option%"=="0" goto END
goto MAIN_MENU

:: ==========================================
:: SECCIÓN 1: FLUJO DIARIO
:: ==========================================
:START_ALL
call :CHECK_DEPS
call :STOP_SILENT
echo 🚀 Despegando (Abriendo red local)...

for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set "TS=%datetime:~0,8%_%datetime:~8,6%"
if not exist "_logs" mkdir "_logs"

if "%LOG_MODE%"=="ON" (
    echo 🔴 CAJA NEGRA ACTIVA...
    start "MQERK Server (REC)" cmd /k "title MQERK Server (REC) & color 4F & cd /d %~dp0%SERVER_DIR% & echo [REC]... & npm run dev -- --host >> %~dp0_logs\server_%TS%.log 2>&1"
    start "MQERK Client (REC)" cmd /k "title MQERK Client (REC) & color 4F & cd /d %~dp0%CLIENT_DIR% & echo [REC]... & npm run dev -- --host >> %~dp0_logs\client_%TS%.log 2>&1"
) else (
    start "MQERK Server" cmd /k "title MQERK Server & color 0A & cd /d %~dp0%SERVER_DIR% & npm run dev -- --host"
    start "MQERK Client" cmd /k "title MQERK Client & color 0B & cd /d %~dp0%CLIENT_DIR% & npm run dev -- --host"
)
timeout /t 5 /nobreak >nul
start %URL_CLIENT%
goto MAIN_MENU

:TOGGLE_LOGS
if "%LOG_MODE%"=="OFF" (set "LOG_MODE=ON") else (set "LOG_MODE=OFF")
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
echo 🏗️  THE ARCHITECT
set /p compName="> Nombre del Componente: "
set "COMP_PATH=%~dp0%CLIENT_DIR%\src\components\%compName%"
if exist "%COMP_PATH%" ( echo ❌ Ya existe. & pause & goto MAIN_MENU )
mkdir "%COMP_PATH%"
(
echo import React from 'react'
echo import './%compName%.css'
echo.
echo const %compName% = ^(^) =^> {
echo   return ^( ^<div className="%compName%"^>^<h1^>%compName% Works!^</h1^>^</div^> ^)
echo }
echo export default %compName%
) > "%COMP_PATH%\%compName%.jsx"
( echo .%compName% { padding: 20px; } ) > "%COMP_PATH%\%compName%.css"
echo ✅ Componente creado.
pause
goto MAIN_MENU

:JARVIS_INSIGHTS
cls
echo 🧠 JARVIS INSIGHTS
echo [Rutas API]
findstr /S /I /C:"app.get" /C:"app.post" /C:"app.put" /C:"app.delete" /C:"router.get" "%~dp0%SERVER_DIR%\*.js"
echo.
echo [TODOs]
findstr /S /I /C:"// TODO" /C:"// FIXME" "%~dp0*.js" "%~dp0*.jsx"
pause
goto MAIN_MENU

:API_TESTER
cls
echo ⚡ THE INTERCEPTOR
set /p endpoint="> Endpoint (ej: /api/users): "
echo Enviando GET a localhost:%SERVER_PORT%%endpoint%...
curl -s http://localhost:%SERVER_PORT%%endpoint%
echo.
pause
goto MAIN_MENU

:NPM_WIZARD
cls
echo 📦 ASISTENTE NPM - [1] Server [2] Client
set /p d="> "
if "%d%"=="1" set "T=%SERVER_DIR%"
if "%d%"=="2" set "T=%CLIENT_DIR%"
set /p p="> Paquete: "
cd /d "%~dp0%T%" & npm install %p% & cd /d "%~dp0"
pause
goto MAIN_MENU

:: ==========================================
:: SECCIÓN 3: GIT MASTER (FIXED V3)
:: ==========================================
:GIT_BRANCH_MANAGER
cls
echo [ GESTOR DE RAMAS ]
echo.
echo --- RAMAS LOCALES ---
git branch 2>nul
echo.
echo --- RAMAS REMOTAS ---
git branch -r 2>nul
echo.
echo  [1] 🔀 Cambiar Rama (Checkout) 
echo  [2] ✨ Crear Rama Nueva
echo  [3] 🔥 Eliminar Rama (Local o Remota)
echo  [V] Volver
set /p o="> "

if "%o%"=="1" goto GIT_OPT_CHECKOUT
if "%o%"=="2" goto GIT_OPT_NEW
if "%o%"=="3" goto GIT_OPT_DELETE_MENU
goto MAIN_MENU

:GIT_OPT_CHECKOUT
echo.
echo Escribe el nombre exacto de la rama a donde quieres ir.
set /p b="> Nombre: "
if "!b!"=="" goto GIT_BRANCH_MANAGER
:: Anti-URL check
echo !b! | findstr /R "http:// https:// git@" >nul
if !errorlevel! equ 0 ( echo [X] Error: Ingresaste una URL. & pause & goto GIT_BRANCH_MANAGER )

git checkout !b! 2>&1
if !errorlevel! neq 0 (
    echo.
    echo [X] Local no encontrada. Buscando en remoto...
    git checkout -b !b! origin/!b! 2>&1
    if !errorlevel! neq 0 (
        REM Intento con el nombre raro del remoto
        for /f %%r in ('git remote') do set "RR=%%r"
        git checkout -b !b! !RR!/!b! 2>&1
    )
)
pause
goto GIT_BRANCH_MANAGER

:GIT_OPT_NEW
echo.
set /p b="> Nombre nueva rama: "
if "!b!"=="" goto GIT_BRANCH_MANAGER
git checkout -b !b! 2>&1
pause
goto GIT_BRANCH_MANAGER

:GIT_OPT_DELETE_MENU
echo.
echo ⚠️  MODO DESTRUCTOR ⚠️
echo  [L] Borrar rama LOCAL (Tu PC)
echo  [R] Borrar rama REMOTA (Nube / GitHub)
set /p type="> Opcion (L/R): "

if /i "%type%"=="L" goto DELETE_LOCAL_ACT
if /i "%type%"=="R" goto DELETE_REMOTE_ACT
goto GIT_BRANCH_MANAGER

:DELETE_LOCAL_ACT
echo.
echo Escribe el nombre de la rama LOCAL a borrar (ej: main):
set /p b="> Nombre: "
if "!b!"=="" goto GIT_BRANCH_MANAGER
echo Borrando rama local !b!...
git branch -D !b!
if !errorlevel! neq 0 echo [X] Error. Quizas estas parado en esa rama.
pause
goto GIT_BRANCH_MANAGER

:DELETE_REMOTE_ACT
echo.
echo --- RAMAS REMOTAS DISPONIBLES ---
git branch -r
echo.
echo Escribe el nombre de la rama a borrar.
echo SOLO el nombre final (Ej: si dice 'alexT1132/feature', escribe 'feature').
echo.
set /p b="> Nombre rama: "
if "!b!"=="" goto GIT_BRANCH_MANAGER

:: Detectar nombre del remoto automaticamente (ej: origin o alexT1132)
set "MY_REMOTE=origin"
for /f %%r in ('git remote') do set "MY_REMOTE=%%r"

echo.
echo ☢️  Intentando borrar '!b!' en remoto '!MY_REMOTE!'...
pause

git push !MY_REMOTE! --delete !b!
if !errorlevel! neq 0 (
    echo.
    echo ❌ FALLO EL BORRADO.
    echo Asegurate de escribir bien el nombre (sin 'origin/' ni 'alexT1132/').
) else (
    echo ✅ Rama borrada del servidor.
)
pause
goto GIT_BRANCH_MANAGER


:GIT_PUSH
cls
echo 📤 SUBIDA A GIT (PUSH)
echo Destino actual:
git remote get-url origin 2>nul || echo (Sin remoto configurado)
echo.
git status -s 2>nul
echo.
set /p msg="> Mensaje del commit: "
if "%msg%"=="" set msg=Update %date%

echo [Git] Add...
git add . 2>nul
echo [Git] Commit...
git commit -m "%msg%" 2>nul
echo [Git] Push...
git push -u origin HEAD
if !errorlevel! neq 0 (
    echo.
    echo [!] Fallo push a 'origin'. Probando remoto alternativo...
    for /f %%r in ('git remote') do set "RR=%%r"
    git push -u !RR! HEAD
)
pause
goto MAIN_MENU

:GIT_REMOTE_MANAGER
cls
echo ══════════════════════════════════════════
echo  🔗 GESTOR DE REPOSITORIO (REMOTE)
echo ══════════════════════════════════════════
echo.
echo ESTADO ACTUAL:
if exist ".git" (
    echo  ✅ Git esta inicializado.
    echo  🌍 URL Remota:
    git remote get-url origin 2>nul
) else (
    echo  ❌ Git NO esta inicializado en esta carpeta.
)
echo.
echo ¿Que deseas hacer?
echo  [1] 🆕 INICIALIZAR PROYECTO (git init + remote + push)
echo  [2] 🔄 CAMBIAR URL DEL REPOSITORIO (Si te cambiaste de repo)
echo  [V] Volver
set /p r="> "

if "%r%"=="1" goto GIT_INIT_FLOW
if "%r%"=="2" goto GIT_CHANGE_URL
goto MAIN_MENU

:GIT_INIT_FLOW
echo.
echo --- INICIALIZANDO NUEVO PROYECTO ---
git init 2>nul
echo.
echo Pega la URL de tu repositorio (GitHub/GitLab):
set /p repo_url="> URL: "
git remote add origin %repo_url% 2>nul
git branch -M main 2>nul
echo.
echo Haciendo primer Push...
git add . 2>nul
git commit -m "Initial commit" 2>nul
git push -u origin main 2>nul
pause
goto MAIN_MENU

:GIT_CHANGE_URL
echo.
echo --- CAMBIANDO DESTINO ---
echo URL Actual:
git remote get-url origin 2>nul
echo.
echo Pega la NUEVA URL del repositorio:
set /p new_url="> Nueva URL: "
git remote set-url origin %new_url% 2>nul
echo.
echo ✅ URL actualizada.
pause
goto MAIN_MENU

:GIT_PULL
git pull 2>nul
if !errorlevel! neq 0 (
    for /f %%r in ('git remote') do git pull %%r HEAD
)
pause & goto MAIN_MENU

:TIME_MACHINE
cls
color 5E
echo 🕒 TIME MACHINE
git log --oneline -n 5 2>nul
set /p c="> ID Commit (o V): "
if /i "%c%"=="V" ( color 0B & goto MAIN_MENU )
git reset --hard %c% 2>nul
color 0B & pause & goto MAIN_MENU

:: ==========================================
:: SECCIÓN 4: CONECTIVIDAD
:: ==========================================
:QR_PORTAL
cls
echo 📱 THE PORTAL
echo Conectar a: http://!LOCAL_IP!:%CLIENT_PORT%
curl -s "https://qrcode.show/http://!LOCAL_IP!:%CLIENT_PORT!"
echo.
pause
goto MAIN_MENU

:EXPOSE_WEB
cls
echo 🌍 MODO INTERNET
curl -s https://loca.lt/mytunnelpassword
echo (Enter para lanzar)
pause >nul
start "TUNNEL" cmd /k "npx localtunnel --port %CLIENT_PORT%"
goto MAIN_MENU

:GENERATE_TOKEN
powershell -Command "[Convert]::ToBase64String((1..48|%%{ [byte](Get-Random -Max 256) }))"
pause & goto MAIN_MENU

:BACKUP_PROJECT
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set "TS=%datetime:~0,8%_%datetime:~8,4%"
robocopy . "_backups\Backup_%TS%" /MIR /XD node_modules .git dist build _backups /XF *.log /NJH /NJS /NDL /NC /NS 2>nul
echo Backup completo en _backups.
pause & goto MAIN_MENU

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
cd /d "%~dp0%SERVER_DIR%" & call npm install 2>nul
cd /d "%~dp0%CLIENT_DIR%" & call npm install 2>nul
cd /d "%~dp0"
color 0B & pause & goto MAIN_MENU

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
if not exist "%~dp0%SERVER_DIR%\node_modules" ( cd /d "%~dp0%SERVER_DIR%" & call npm install 2>nul & cd /d "%~dp0" )
if not exist "%~dp0%CLIENT_DIR%\node_modules" ( cd /d "%~dp0%CLIENT_DIR%" & call npm install 2>nul & cd /d "%~dp0" )
goto :eof

:END
exit