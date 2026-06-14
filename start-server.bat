@echo off
setlocal
cd /d "%~dp0"

where python >nul 2>nul
if %errorlevel%==0 (
  python --version >nul 2>nul
  if %errorlevel%==0 (
    python -m http.server 8000 --bind 127.0.0.1
    exit /b %errorlevel%
  )
)

where py >nul 2>nul
if %errorlevel%==0 (
  py --version >nul 2>nul
  if %errorlevel%==0 (
    py -m http.server 8000 --bind 127.0.0.1
    exit /b %errorlevel%
  )
)

for /d %%D in ("%LocalAppData%\Programs\Python\Python*") do (
  if exist "%%~D\python.exe" (
    "%%~D\python.exe" -m http.server 8000 --bind 127.0.0.1
    exit /b %errorlevel%
  )
)

for /d %%D in ("%ProgramFiles%\Python*") do (
  if exist "%%~D\python.exe" (
    "%%~D\python.exe" -m http.server 8000 --bind 127.0.0.1
    exit /b %errorlevel%
  )
)

for /d %%D in ("%ProgramFiles(x86)%\Python*") do (
  if exist "%%~D\python.exe" (
    "%%~D\python.exe" -m http.server 8000 --bind 127.0.0.1
    exit /b %errorlevel%
  )
)

set "BUNDLED_PYTHON=C:\Users\1080p\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if exist "%BUNDLED_PYTHON%" (
  "%BUNDLED_PYTHON%" -m http.server 8000 --bind 127.0.0.1
  exit /b %errorlevel%
)

echo Python was not found. Install Python, use VS Code Live Server, or run with another static server.
exit /b 1
