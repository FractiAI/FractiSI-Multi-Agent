# Tiny Footprint · GeForce / nvidia-smi lab on this Windows laptop (GTX 860M class).
# Run from repo root in PowerShell:  powershell -File scripts/run_geforce_lab.ps1
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Host '=== nvidia-smi ==='
& nvidia-smi
if ($LASTEXITCODE -ne 0) { throw 'nvidia-smi failed — this script is for the GeForce laptop only' }

Write-Host '=== tiny doctor ==='
node scripts/tiny.mjs doctor
if ($LASTEXITCODE -ne 0) { throw 'doctor failed' }

Write-Host '=== tiny benchmark (includes GPU live chat lab) ==='
node scripts/tiny.mjs benchmark
if ($LASTEXITCODE -ne 0) { throw 'benchmark failed' }

$lab = Join-Path (Get-Location) 'benchmarks/reports/gpu_live_chat_hbm_lab.json'
if (-not (Test-Path $lab)) {
  $lab = Join-Path (Get-Location) 'research/synthobs-tiny-gateway-rhyming-templates/data/gpu_live_chat_hbm_lab.json'
}
Write-Host "=== lab receipt: $lab ==="
Get-Content $lab -Raw
