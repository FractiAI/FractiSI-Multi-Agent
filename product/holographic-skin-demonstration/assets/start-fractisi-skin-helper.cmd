@echo off
set CFG=%USERPROFILE%\.config\fractisi-skin\helper.json
if exist "%CFG%" (
  for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "(Get-Content '%CFG%' | ConvertFrom-Json).node"`) do set NODE=%%i
  for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "(Get-Content '%CFG%' | ConvertFrom-Json).script"`) do set SCRIPT=%%i
  if defined NODE if defined SCRIPT (
    echo Starting FractiSI Soft Story helper...
    start "" /min "%NODE%" "%SCRIPT%" --companion-only --no-open
    echo Helper started.
    exit /b 0
  )
)
echo Run this once in your FractiSI-Multi-Agent clone:
echo   npm run skin:auto-session:install
pause
