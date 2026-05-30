# Packages the extension into a versioned zip for Chrome / Edge submission.
#
# Usage:  pwsh ./build.ps1
# Output: dist/shortcut-blocker-v<version>.zip  (version read from manifest.json)
# Files are staged first so $exclude patterns (e.g. source .svg) are kept in the
# repo but never shipped, and dev files never leak into the package.

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
Set-Location $root

$include = @(
  'manifest.json',
  'background.js',
  'content.js',
  'popup.css',
  'popup.html',
  'popup.js',
  'icons',
  '_locales'
)
# Glob patterns to drop from the staged copy before zipping.
$exclude = @('*.svg')

$missing = $include | Where-Object { -not (Test-Path (Join-Path $root $_)) }
if ($missing) { throw "Missing files, aborting: $($missing -join ', ')" }

$manifest = Get-Content (Join-Path $root 'manifest.json') -Raw | ConvertFrom-Json
$version = $manifest.version
if (-not $version) { throw 'manifest.json has no "version" field.' }

$distDir = Join-Path $root 'dist'
$out = Join-Path $distDir "shortcut-blocker-v$version.zip"
$stage = Join-Path $distDir '_stage'

New-Item -ItemType Directory -Force -Path $distDir | Out-Null
if (Test-Path $stage) { Remove-Item -Recurse -Force $stage }
New-Item -ItemType Directory -Force -Path $stage | Out-Null

foreach ($item in $include) {
  $src = Join-Path $root $item
  $dst = Join-Path $stage $item
  if (Test-Path $src -PathType Container) {
    Copy-Item $src $dst -Recurse
  } else {
    Copy-Item $src $dst
  }
}

Get-ChildItem $stage -Recurse -File -Include $exclude | Remove-Item -Force

if (Test-Path $out) { Remove-Item $out }
Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $out
Remove-Item -Recurse -Force $stage

$size = [math]::Round((Get-Item $out).Length / 1KB, 1)
Write-Host "Built $out ($size KB)" -ForegroundColor Green
