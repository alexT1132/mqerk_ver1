@echo off
REM Inicia backend y frontend y permite detenerlos (mata procesos) al finalizar.
REM Usa PowerShell para capturar PIDs de los procesos npm.

setlocal ENABLEDELAYEDEXPANSION
for %%I in ("%~dp0.") do set ROOT=%%~fI

echo ==============================================
echo   MQERK - Backend + Frontend (modo gestionado)
echo   Carpeta root: %ROOT%
echo ==============================================

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js no esta instalado o no esta en PATH.
  pause
  goto :eof
)

call :ensureDeps "Backend" "server"
call :ensureDeps "Frontend" "client"

echo.
echo Lanzando servicios y capturando PIDs...
call :spawn "Backend" "server" "run" "dev" BACK_PID
call :spawn "Frontend" "client" "run" "dev" FRONT_PID

if not defined BACK_PID (
  echo [Backend] ERROR: No se obtuvo PID. Abortando.
  goto :cleanup
)
if not defined FRONT_PID (
  echo [Frontend] ERROR: No se obtuvo PID. Abortando.
  goto :cleanup
)

echo.
echo Backend PID: %BACK_PID%
echo Frontend PID: %FRONT_PID%
echo.
REM Detectar puertos
set VITE_PORT=
for /f %%P in ('powershell -NoLogo -NoProfile -Command "(Get-Content '%ROOT%\client\vite.config.js') -match 'port:' ^| Select-Object -First 1 ^| ForEach-Object { ($_ -replace '[^0-9]','') }"') do set VITE_PORT=%%P
if not defined VITE_PORT set VITE_PORT=5173
set API_PORT=
for /f %%P in ('powershell -NoLogo -NoProfile -Command "(Get-Content '%ROOT%\server\index.js') -match 'PORT = ' ^| Select-Object -First 1 ^| ForEach-Object { ($_ -replace '[^0-9]','') }"') do set API_PORT=%%P
if not defined API_PORT set API_PORT=1002
echo Frontend port: %VITE_PORT%  |  Backend port: %API_PORT%
echo Abriendo navegador en 3s (http://localhost:%VITE_PORT%)...
start "Abrir Navegador" powershell -NoLogo -NoProfile -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:%VITE_PORT%'"
echo.
echo Presiona ENTER para detener ambos servicios (se hara taskkill /T /F)...
pause >nul

:cleanup
echo Deteniendo servicios...
if defined FRONT_PID taskkill /PID %FRONT_PID% /T /F >nul 2>&1 && echo [Frontend] Terminado.
if defined BACK_PID taskkill /PID %BACK_PID% /T /F >nul 2>&1 && echo [Backend] Terminado.
echo Listo.
endlocal
goto :eof

:ensureDeps
REM %1 Nombre, %2 subcarpeta
set NAME=%~1
set DIR=%~2
if not exist "%ROOT%\%DIR%\package.json" (
  echo [%NAME%] ERROR: Falta package.json en %DIR%
  goto :eof
)
if not exist "%ROOT%\%DIR%\node_modules" (
  echo [%NAME%] Instalando dependencias...
  pushd "%ROOT%\%DIR%"
  call npm install
  if errorlevel 1 (
    echo [%NAME%] ERROR durante npm install.
  )
  popd
)
goto :eof

:spawn
REM %1 Nombre, %2 Carpeta, %3 arg1, %4 arg2 (para npm), %5 var destino PID
set SNAME=%~1
set SDIR=%~2
set NPMARG1=%~3
set NPMARG2=%~4
set DESTVAR=%~5
echo [%SNAME%] Iniciando (npm %NPMARG1% %NPMARG2%) ...
REM Iniciamos proceso y capturamos PID usando PowerShell Start-Process -PassThru
for /f "usebackq tokens=*" %%P in (`powershell -NoLogo -NoProfile -Command ^
  "$p = Start-Process npm -ArgumentList '%NPMARG1%','%NPMARG2%' -WorkingDirectory '%ROOT%\\%SDIR%' -PassThru -WindowStyle Hidden; $p.Id"`) do (
  set PID_TEMP=%%P
)
if defined PID_TEMP (
  set %DESTVAR%=%PID_TEMP%
  echo [%SNAME%] PID=%PID_TEMP% (logs en tiempo real no adjuntados; usa ventana separada si lo deseas)
) else (
  echo [%SNAME%] ERROR: No se pudo capturar PID.
)
set PID_TEMP=
goto :eof

REM Nota: Para logs en vivo puedes abrir 'start "BackendLog" cmd /k "cd server && npm run dev"' en vez de modo oculto.
REM Alternativa mas simple: usar 'concurrently' desde un package.json raiz y CTRL+C para terminar.
