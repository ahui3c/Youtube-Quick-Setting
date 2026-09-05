$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$nodeCommand = Get-Command node -ErrorAction Stop
& $nodeCommand.Source (Join-Path $PSScriptRoot "build-platforms.js") firefox

$manifest = Get-Content -Raw -LiteralPath (Join-Path $projectRoot "manifest.json") | ConvertFrom-Json
$sourceDirectory = Join-Path $projectRoot "dist-firefox"
$artifactDirectory = Join-Path $projectRoot "deliverables\firefox"
$artifactPath = Join-Path $artifactDirectory ("YouTube-Quick-Settings-Toolbox-v{0}-Firefox.zip" -f $manifest.version)

New-Item -ItemType Directory -Force -Path $artifactDirectory | Out-Null
if (Test-Path -LiteralPath $artifactPath) {
  Remove-Item -LiteralPath $artifactPath -Force
}

Compress-Archive -Path (Join-Path $sourceDirectory "*") -DestinationPath $artifactPath -CompressionLevel Optimal
$stream = [System.IO.File]::OpenRead($artifactPath)
try {
  $sha256 = [System.Security.Cryptography.SHA256]::Create()
  try {
    $hashBytes = $sha256.ComputeHash($stream)
  } finally {
    $sha256.Dispose()
  }
} finally {
  $stream.Dispose()
}
$hashText = [System.BitConverter]::ToString($hashBytes).Replace("-", "").ToLowerInvariant()
$hashLine = "{0}  {1}" -f $hashText, (Split-Path -Leaf $artifactPath)
Set-Content -LiteralPath ($artifactPath + ".sha256") -Value $hashLine -Encoding ascii
Write-Output $artifactPath
