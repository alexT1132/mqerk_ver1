@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║              MQERK - Gestor de Servicios                    ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:MENU
echo [1] Iniciar Server + Client
echo [2] Detener todos los procesos
echo [3] Reiniciar (Detener + Iniciar)
echo [4] Solo Server (puerto 1002)
echo [5] Solo Client (puerto 5173)
echo [6] Ver procesos activos
echo [7] Limpiar puertos 1002 y 5173
echo [8] Limpiar procesos rezagados (Node/Nodemon)
echo [0] Salir
echo.
set /p option="Selecciona una opción: "

if "%option%"=="1" goto START_ALL
if "%option%"=="2" goto STOP_ALL
if "%option%"=="3" goto RESTART
if "%option%"=="4" goto START_SERVER
if "%option%"=="5" goto START_CLIENT
if "%option%"=="6" goto SHOW_PROCESSES
if "%option%"=="7" goto CLEAN_PORTS
if "%option%"=="8" goto CLEAN_PROCESSES
if "%option%"=="0" goto END
goto MENU

:START_ALL
echo.
echo ══════════════════════════════════════════════════════════
echo  Iniciando Server y Client...
echo ══════════════════════════════════════════════════════════
call :CLEAN_PORTS
timeout /t 2 /nobreak >nul

echo.
echo [1/2] Iniciando Server (puerto 1002)...
start "MQERK Server" cmd /k "cd /d %~dp0server && npm run dev"
timeout /t 3 /nobreak >nul

echo [2/2] Iniciando Client (puerto 5173)...
start "MQERK Client" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ✅ Servicios iniciados correctamente
echo    - Server: http://localhost:1002
echo    - Client: http://localhost:5173
echo.
pause
goto MENU

:STOP_ALL
echo.
echo ══════════════════════════════════════════════════════════
echo  Deteniendo todos los procesos...
echo ══════════════════════════════════════════════════════════

echo Matando procesos de Node.js y Nodemon...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM nodemon.exe 2>nul
if %errorlevel%==0 (
    echo ✅ Procesos Node.js/Nodemon detenidos
) else (
    echo ⚠️  No se encontraron procesos Node.js/Nodemon activos
)

echo Liberando puerto 5173...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    taskkill /F /PID %%a 2>nul
)

echo Liberando puerto 1002...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :1002') do (
    taskkill /F /PID %%a 2>nul
)

echo.
echo ✅ Todos los procesos detenidos
echo.
pause
goto MENU

:RESTART
echo.
echo ══════════════════════════════════════════════════════════
echo  Reiniciando servicios...
echo ══════════════════════════════════════════════════════════
call :STOP_ALL
timeout /t 2 /nobreak >nul
call :START_ALL
goto MENU

:START_SERVER
echo.
echo ══════════════════════════════════════════════════════════
echo  Iniciando solo Server (puerto 1002)...
echo ══════════════════════════════════════════════════════════
call :CLEAN_PORT_1002
timeout /t 1 /nobreak >nul
start "MQERK Server" cmd /k "cd /d %~dp0server && npm run dev"
echo ✅ Server iniciado en http://localhost:1002
echo.
pause
goto MENU

:START_CLIENT
echo.
echo ══════════════════════════════════════════════════════════
echo  Iniciando solo Client (puerto 5173)...
echo ══════════════════════════════════════════════════════════
call :CLEAN_PORT_5173
timeout /t 1 /nobreak >nul
start "MQERK Client" cmd /k "cd /d %~dp0client && npm run dev"
echo ✅ Client iniciado en http://localhost:5173
echo.
pause
goto MENU

:SHOW_PROCESSES
echo.
echo ══════════════════════════════════════════════════════════
echo  Procesos Node.js y Nodemon activos:
echo ══════════════════════════════════════════════════════════
tasklist | findstr /i "node.exe nodemon.exe"
echo.
echo ══════════════════════════════════════════════════════════
echo  Puertos 1002 y 5173:
echo ══════════════════════════════════════════════════════════
netstat -ano | findstr :1002
netstat -ano | findstr :5173
echo.
pause
goto MENU

:CLEAN_PORTS
call :CLEAN_PORT_5173
call :CLEAN_PORT_1002
goto :eof

:CLEAN_PORT_5173
echo Liberando puerto 5173...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /F /PID %%a 2>nul
    if %errorlevel%==0 echo ✅ Puerto 5173 liberado
)
goto :eof

:CLEAN_PORT_1002
echo Liberando puerto 1002...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :1002 ^| findstr LISTENING') do (
    taskkill /F /PID %%a 2>nul
    if %errorlevel%==0 echo ✅ Puerto 1002 liberado
)
goto :eof

:CLEAN_PROCESSES
echo.
echo ══════════════════════════════════════════════════════════
echo  Limpiando procesos rezagados...
echo ══════════════════════════════════════════════════════════
echo.
tasklist | findstr /i "node.exe nodemon.exe" >nul
if %errorlevel%==0 (
    echo Procesos encontrados:
    tasklist | findstr /i "node.exe nodemon.exe"
    echo.
    echo ¿Deseas terminar todos los procesos? (S/N)
    set /p confirmar="> "
    if /i "!confirmar!"=="S" (
        taskkill /F /IM node.exe 2>nul
        taskkill /F /IM nodemon.exe 2>nul
        echo ✅ Procesos terminados
    ) else (
        echo Operación cancelada
    )
) else (
    echo ℹ️  No se encontraron procesos de Node.js/Nodemon activos
)
echo.
pause
goto MENU

:END
echo.
echo ══════════════════════════════════════════════════════════
echo  ¿Deseas detener los servicios antes de salir?
echo ══════════════════════════════════════════════════════════
set /p stop="[S]í / [N]o: "
if /i "%stop%"=="S" call :STOP_ALL
echo.
echo Hasta luego! 👋
timeout /t 2 /nobreak >nul
exit
