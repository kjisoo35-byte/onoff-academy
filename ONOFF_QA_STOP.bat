@echo off
setlocal EnableExtensions
chcp 65001 >nul

set "QA_ROOT=%~dp0"
set "RUNTIME_FILE=%QA_ROOT%.qa-runtime.cmd"
set "SERVER_TITLE=ONOFF_QA_SERVER"
set "QA_PORT="
set "QA_DEVICE_SERIAL="
set "ADB_EXE=%USERPROFILE%\Desktop\ChatGPT\scrcpy-win64-v4.1\scrcpy-win64-v4.1\adb.exe"

if exist "%RUNTIME_FILE%" call "%RUNTIME_FILE%"
if not exist "%ADB_EXE%" for /f "delims=" %%I in ('where adb.exe 2^>nul') do if not defined ADB_FOUND set "ADB_FOUND=%%I"
if defined ADB_FOUND set "ADB_EXE=%ADB_FOUND%"

if /i not "%~1"=="/quiet" (
  echo.
  echo ========================================
  echo   ONOFF QA STOP
  echo ========================================
)

echo [1/4] Stopping Preview server...
taskkill /FI "WINDOWTITLE eq %SERVER_TITLE%*" /T /F >nul 2>&1
if defined QA_PORT (
  for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%QA_PORT% .*LISTENING"') do taskkill /PID %%P /T /F >nul 2>&1
)

echo [2/4] Stopping scrcpy...
taskkill /IM scrcpy.exe /T /F >nul 2>&1

echo [3/4] Stopping ADB reverse and server...
if exist "%ADB_EXE%" (
  if defined QA_DEVICE_SERIAL (
    powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$p=Start-Process -FilePath '%ADB_EXE%' -ArgumentList @('-s','%QA_DEVICE_SERIAL%','reverse','--remove-all') -WindowStyle Hidden -PassThru; if(-not $p.WaitForExit(3000)){ $p.Kill() }" >nul 2>&1
    powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$p=Start-Process -FilePath '%ADB_EXE%' -ArgumentList @('-s','%QA_DEVICE_SERIAL%','shell','am','force-stop','com.android.chrome') -WindowStyle Hidden -PassThru; if(-not $p.WaitForExit(3000)){ $p.Kill() }" >nul 2>&1
  ) else (
    powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$p=Start-Process -FilePath '%ADB_EXE%' -ArgumentList @('reverse','--remove-all') -WindowStyle Hidden -PassThru; if(-not $p.WaitForExit(3000)){ $p.Kill() }" >nul 2>&1
    powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$p=Start-Process -FilePath '%ADB_EXE%' -ArgumentList @('shell','am','force-stop','com.android.chrome') -WindowStyle Hidden -PassThru; if(-not $p.WaitForExit(3000)){ $p.Kill() }" >nul 2>&1
  )
)
taskkill /IM adb.exe /T /F >nul 2>&1

echo [4/4] Cleaning QA runtime files...
if exist "%RUNTIME_FILE%" del /Q "%RUNTIME_FILE%" >nul 2>&1

if /i not "%~1"=="/quiet" echo [DONE] QA environment stopped.
exit /b 0
