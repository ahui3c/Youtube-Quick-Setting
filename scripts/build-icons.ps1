param(
    [string]$SourcePath = (Join-Path $PSScriptRoot '..\assets\icon-source.png')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$assetsPath = Join-Path $projectRoot 'assets'
$iconsPath = Join-Path $assetsPath 'icons'
[System.IO.Directory]::CreateDirectory($iconsPath) | Out-Null

$source = [System.Drawing.Bitmap]::FromFile([System.IO.Path]::GetFullPath($SourcePath))
try {
    # The generated tile occupies this centered square. Cropping removes the
    # model-rendered white backdrop while preserving the designed symbol.
    $cropSize = [Math]::Min($source.Width, $source.Height) - 112
    $cropX = [int](($source.Width - $cropSize) / 2)
    $cropY = [int](($source.Height - $cropSize) / 2)

    $masterSize = 512
    $master = New-Object System.Drawing.Bitmap($masterSize, $masterSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
        $graphics = [System.Drawing.Graphics]::FromImage($master)
        try {
            $graphics.Clear([System.Drawing.Color]::Transparent)
            $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
            $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

            $radius = 112
            $diameter = $radius * 2
            $path = New-Object System.Drawing.Drawing2D.GraphicsPath
            try {
                $path.AddArc(0, 0, $diameter, $diameter, 180, 90)
                $path.AddArc($masterSize - $diameter, 0, $diameter, $diameter, 270, 90)
                $path.AddArc($masterSize - $diameter, $masterSize - $diameter, $diameter, $diameter, 0, 90)
                $path.AddArc(0, $masterSize - $diameter, $diameter, $diameter, 90, 90)
                $path.CloseFigure()
                $graphics.SetClip($path)
                $sourceRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropSize, $cropSize)
                $destRect = New-Object System.Drawing.Rectangle(0, 0, $masterSize, $masterSize)
                $graphics.DrawImage($source, $destRect, $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
            } finally {
                $path.Dispose()
            }
        } finally {
            $graphics.Dispose()
        }

        $masterPath = Join-Path $assetsPath 'icon-master.png'
        $master.Save($masterPath, [System.Drawing.Imaging.ImageFormat]::Png)

        foreach ($size in @(16, 32, 48, 128)) {
            $icon = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
            try {
                $iconGraphics = [System.Drawing.Graphics]::FromImage($icon)
                try {
                    $iconGraphics.Clear([System.Drawing.Color]::Transparent)
                    $iconGraphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
                    $iconGraphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
                    $iconGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                    $iconGraphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
                    $iconGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
                    $iconGraphics.DrawImage($master, 0, 0, $size, $size)
                } finally {
                    $iconGraphics.Dispose()
                }
                $icon.Save((Join-Path $iconsPath "icon-$size.png"), [System.Drawing.Imaging.ImageFormat]::Png)
            } finally {
                $icon.Dispose()
            }
        }
    } finally {
        $master.Dispose()
    }
} finally {
    $source.Dispose()
}

Write-Output "Chrome icons generated in $iconsPath"
