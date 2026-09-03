@echo off
setlocal
echo ZENZY Phase 1B-FST - INTERNAL / MOCK / NON-PRODUCTION
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0founder-smoke.ps1"
set EXITCODE=%ERRORLEVEL%
echo.
if not "%EXITCODE%"=="0" (
  echo Founder Smoke launcher stopped with exit code %EXITCODE%.
  echo No production deployment or release action was performed.
)
exit /b %EXITCODE%
