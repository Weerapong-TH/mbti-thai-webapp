$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$BundledPython = "C:\Users\1080p\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"

Set-Location $ProjectRoot

if (Get-Command python -ErrorAction SilentlyContinue) {
  python --version *> $null
  if ($LASTEXITCODE -eq 0) {
    python -m http.server 8000 --bind 127.0.0.1
    exit $LASTEXITCODE
  }
}

if (Get-Command py -ErrorAction SilentlyContinue) {
  py --version *> $null
  if ($LASTEXITCODE -eq 0) {
    py -m http.server 8000 --bind 127.0.0.1
    exit $LASTEXITCODE
  }
}

$CommonPythonRoots = @(
  "$env:LocalAppData\Programs\Python",
  "$env:ProgramFiles",
  "${env:ProgramFiles(x86)}"
)

foreach ($Root in $CommonPythonRoots) {
  if (-not $Root -or -not (Test-Path $Root)) {
    continue
  }

  $PythonExe = Get-ChildItem -Path $Root -Directory -Filter "Python*" -ErrorAction SilentlyContinue |
    ForEach-Object { Join-Path $_.FullName "python.exe" } |
    Where-Object { Test-Path $_ } |
    Select-Object -First 1

  if ($PythonExe) {
    & $PythonExe -m http.server 8000 --bind 127.0.0.1
    exit $LASTEXITCODE
  }
}

if (Test-Path $BundledPython) {
  & $BundledPython -m http.server 8000 --bind 127.0.0.1
  exit $LASTEXITCODE
}

Write-Host "Python was not found. Install Python, use VS Code Live Server, or run with another static server."
exit 1
