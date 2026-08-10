@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul

set "QA_ROOT=%~dp0"
for %%I in ("%QA_ROOT%..") do set "GITHUB_ROOT=%%~fI"
set "ACADEMY_DIR=%QA_ROOT:~0,-1%"
set "PLATFORM_DIR=%GITHUB_ROOT%\onoff-safety-portal"
set "RUNTIME_FILE=%QA_ROOT%.qa-runtime.cmd"
set "WIRELESS_FILE=%QA_ROOT%.qa-wireless-device.cmd"
set "SERVER_TITLE=ONOFF_QA_SERVER"

echo.
echo ========================================
echo   ONOFF QA START
echo ========================================
echo   1. Platform
echo   2. Academy
echo.
set "QA_CHOICE="
if /i "%~1"=="Platform" set "QA_CHOICE=1"
if /i "%~1"=="Academy" set "QA_CHOICE=2"
if not defined QA_CHOICE set /p "QA_CHOICE=Select project [1/2]: "

if "%QA_CHOICE%"=="1" (
  set "QA_PROJECT=Platform"
  set "PROJECT_DIR=%PLATFORM_DIR%"
  set "QA_PORT=4173"
  set "QA_PATH=/__preview"
  set "FALLBACK_COMMAND=npm run preview"
) else if "%QA_CHOICE%"=="2" (
  set "QA_PROJECT=Academy"
  set "PROJECT_DIR=%ACADEMY_DIR%"
  set "QA_PORT=4174"
  set "QA_PATH=/__preview?path=%%2Findex.html"
  set "FALLBACK_COMMAND=npm run dev"
) else (
  echo [ERROR] Select 1 or 2.
  exit /b 1
)

if not exist "%PROJECT_DIR%\package.json" (
  echo [ERROR] Project not found: %PROJECT_DIR%
  exit /b 1
)

set "SCRCPY_DIR=%USERPROFILE%\Desktop\ChatGPT\scrcpy-win64-v4.1\scrcpy-win64-v4.1"
set "ADB_EXE=%SCRCPY_DIR%\adb.exe"
set "SCRCPY_EXE=%SCRCPY_DIR%\scrcpy.exe"
if not exist "%ADB_EXE%" for /f "delims=" %%I in ('where adb.exe 2^>nul') do if not defined ADB_FOUND set "ADB_FOUND=%%I"
if defined ADB_FOUND set "ADB_EXE=%ADB_FOUND%"
if not exist "%SCRCPY_EXE%" for /f "delims=" %%I in ('where scrcpy.exe 2^>nul') do if not defined SCRCPY_FOUND set "SCRCPY_FOUND=%%I"
if defined SCRCPY_FOUND set "SCRCPY_EXE=%SCRCPY_FOUND%"
set "PATH=%SCRCPY_DIR%;%PATH%"

if not exist "%ADB_EXE%" (
  echo [ERROR] adb.exe not found.
  exit /b 1
)
if not exist "%SCRCPY_EXE%" (
  echo [ERROR] scrcpy.exe not found.
  exit /b 1
)

call "%QA_ROOT%ONOFF_QA_STOP.bat" /quiet >nul 2>&1
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%QA_PORT% .*LISTENING"') do taskkill /PID %%P /T /F >nul 2>&1

set "SERVER_COMMAND=%FALLBACK_COMMAND%"
set "SERVER_MODE=Project Preview"
if exist "%PROJECT_DIR%\node_modules\.bin\vite.cmd" if exist "%PROJECT_DIR%\dist" (
  set "SERVER_COMMAND=call node_modules\.bin\vite.cmd preview --host 0.0.0.0 --port %QA_PORT%"
  set "SERVER_MODE=Vite Preview"
)

echo [1/6] Project: %QA_PROJECT%
echo [2/6] Starting %SERVER_MODE% on port %QA_PORT%...
start "%SERVER_TITLE%" /min /D "%PROJECT_DIR%" cmd.exe /d /c "set PORT=%QA_PORT%&& set PREVIEW_PORT=%QA_PORT%&& %SERVER_COMMAND%"

set "QA_URL=http://127.0.0.1:%QA_PORT%%QA_PATH%"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$u='%QA_URL%'; $end=(Get-Date).AddSeconds(25); do { try { $r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 $u; if($r.StatusCode -ge 200 -and $r.StatusCode -lt 500){exit 0} } catch {}; Start-Sleep -Milliseconds 500 } while((Get-Date) -lt $end); exit 1"
if errorlevel 1 (
  echo [ERROR] Preview server did not respond: %QA_URL%
  call "%QA_ROOT%ONOFF_QA_STOP.bat" /quiet >nul 2>&1
  exit /b 1
)

echo [3/6] Starting ADB Wireless...
"%ADB_EXE%" start-server >nul
set "USB_SERIAL="
set "WIRELESS_SERIAL="
set "QA_DEVICE_IP="
for /f "skip=1 tokens=1,2" %%A in ('adb.exe devices') do if "%%B"=="device" (
  set "DEVICE_CANDIDATE=%%A"
  if not "!DEVICE_CANDIDATE::=!"=="!DEVICE_CANDIDATE!" (
    if not defined WIRELESS_SERIAL set "WIRELESS_SERIAL=%%A"
  ) else (
    if not defined USB_SERIAL set "USB_SERIAL=%%A"
  )
)

if defined WIRELESS_SERIAL (
  for /f "tokens=1 delims=:" %%I in ("!WIRELESS_SERIAL!") do set "QA_DEVICE_IP=%%I"
) else if defined USB_SERIAL (
  echo       USB device: !USB_SERIAL!
  set "RAW_IP="
  echo       Checking: adb shell ip addr show wlan0
  for /f "tokens=2" %%I in ('adb.exe -s "!USB_SERIAL!" shell ip addr show wlan0 ^| findstr /R /C:"inet [0-9]"') do if not defined RAW_IP set "RAW_IP=%%I"
  for /f "tokens=1 delims=/" %%I in ("!RAW_IP!") do set "QA_DEVICE_IP=%%I"
  if not defined QA_DEVICE_IP (
    echo       Checking fallback: adb shell ip route
    set "ROUTE_IP="
    set "TAKE_ROUTE_IP="
    for /f "delims=" %%R in ('adb.exe -s "!USB_SERIAL!" shell ip route ^| findstr /C:"src"') do (
      for %%T in (%%R) do (
        if defined TAKE_ROUTE_IP if not defined ROUTE_IP set "ROUTE_IP=%%T"
        if "%%T"=="src" set "TAKE_ROUTE_IP=1"
      )
    )
    if defined ROUTE_IP set "QA_DEVICE_IP=!ROUTE_IP!"
  )
  if not defined QA_DEVICE_IP (
    echo [ERROR] Device Wi-Fi IP could not be detected. Connect Fold7 to Wi-Fi and retry.
    call "%QA_ROOT%ONOFF_QA_STOP.bat" /quiet >nul 2>&1
    exit /b 1
  )
  echo       Device Wi-Fi IP: !QA_DEVICE_IP!
  >"%WIRELESS_FILE%" echo set "QA_DEVICE_IP=!QA_DEVICE_IP!"
  "%ADB_EXE%" -s "!USB_SERIAL!" tcpip 5555 >nul
  powershell.exe -NoProfile -Command "Start-Sleep -Seconds 2"
  "%ADB_EXE%" connect !QA_DEVICE_IP!:5555 >nul
  set "WIRELESS_SERIAL=!QA_DEVICE_IP!:5555"
) else (
  if exist "%WIRELESS_FILE%" call "%WIRELESS_FILE%"
  if not defined QA_DEVICE_IP (
    echo [ERROR] No saved wireless device. Connect Fold7 by USB once and retry.
    call "%QA_ROOT%ONOFF_QA_STOP.bat" /quiet >nul 2>&1
    exit /b 1
  )
  "%ADB_EXE%" connect !QA_DEVICE_IP!:5555 >nul
  set "WIRELESS_SERIAL=!QA_DEVICE_IP!:5555"
)

"%ADB_EXE%" -s "!WIRELESS_SERIAL!" get-state 2>nul | findstr /X "device" >nul
if errorlevel 1 (
  echo [ERROR] ADB Wireless connection failed: !WIRELESS_SERIAL!
  call "%QA_ROOT%ONOFF_QA_STOP.bat" /quiet >nul 2>&1
  exit /b 1
)
"%ADB_EXE%" -s "!WIRELESS_SERIAL!" reverse tcp:%QA_PORT% tcp:%QA_PORT% >nul
echo       Wireless device: !WIRELESS_SERIAL!
echo       [READY] USB cable can now be removed.

echo [4/6] Starting scrcpy...
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%SCRCPY_EXE%' -ArgumentList '--serial=!WIRELESS_SERIAL!','--stay-awake' -WorkingDirectory '%SCRCPY_DIR%'"

echo [5/6] Opening Chrome on device...
"%ADB_EXE%" -s "!WIRELESS_SERIAL!" shell am force-stop com.android.chrome >nul
"%ADB_EXE%" -s "!WIRELESS_SERIAL!" shell am start -a android.intent.action.VIEW -d "%QA_URL%" com.android.chrome >nul
set "CHROME_CHECK=PASS"
if errorlevel 1 set "CHROME_CHECK=FAIL"

echo [6/6] Opening desktop Preview URL...
start "" "%QA_URL%"

> "%RUNTIME_FILE%" echo set "QA_PROJECT=%QA_PROJECT%"
>>"%RUNTIME_FILE%" echo set "QA_PORT=%QA_PORT%"
>>"%RUNTIME_FILE%" echo set "QA_URL=%QA_URL%"
>>"%RUNTIME_FILE%" echo set "SERVER_TITLE=%SERVER_TITLE%"
>>"%RUNTIME_FILE%" echo set "QA_DEVICE_IP=!QA_DEVICE_IP!"
>>"%RUNTIME_FILE%" echo set "QA_DEVICE_SERIAL=!WIRELESS_SERIAL!"

powershell.exe -NoProfile -Command "Start-Sleep -Seconds 2"
set "SCRCPY_CHECK=FAIL"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$p=Get-Process scrcpy -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 }; if($p){exit 0}else{exit 1}" >nul 2>&1
if not errorlevel 1 set "SCRCPY_CHECK=PASS"

echo.
echo ========================================
echo          QA CHECK
echo ========================================
echo Project : %QA_PROJECT%
echo Device Wi-Fi : PASS
echo ADB Wireless : PASS
echo scrcpy       : !SCRCPY_CHECK!
echo Chrome       : !CHROME_CHECK!
echo Preview      : PASS
echo URL     : %QA_URL%
echo Port    : %QA_PORT%
echo ========================================
echo.

echo.
echo [READY] %QA_PROJECT% QA environment is running.
echo [URL] %QA_URL%
echo [STOP] Run ONOFF_QA_STOP.bat when QA is finished.
exit /b 0
