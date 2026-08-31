# generate-media.ps1 - creates branded placeholder art for public/media.
# Run from the repo root:  powershell -NoProfile -ExecutionPolicy Bypass -File scripts/generate-media.ps1
# Replace these placeholders with real brand art whenever it is ready;
# keep the same filenames (they are referenced by src/lib/content.ts and layout.tsx).

Add-Type -AssemblyName System.Drawing

$outDir = Join-Path $PSScriptRoot "..\public\media"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

function New-Art {
  param(
    [string]$Name, [int]$W, [int]$H,
    [string]$Label, [string]$Sub,
    [int]$AccentR, [int]$AccentG, [int]$AccentB
  )

  $bmp = New-Object System.Drawing.Bitmap($W, $H)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

  # background: vertical gradient, deep violet to near black
  $rect = New-Object System.Drawing.Rectangle(0, 0, $W, $H)
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $rect,
    [System.Drawing.Color]::FromArgb(255, 13, 7, 24),
    [System.Drawing.Color]::FromArgb(255, 7, 5, 16),
    90.0)
  $g.FillRectangle($brush, $rect)

  # ember glow
  $glowPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $glowPath.AddEllipse([single]($W*0.5), [single]($H*0.05), [single]($W*0.75), [single]($H*0.95))
  $pgb = New-Object System.Drawing.Drawing2D.PathGradientBrush($glowPath)
  $pgb.CenterColor = [System.Drawing.Color]::FromArgb(120, $AccentR, $AccentG, $AccentB)
  $pgb.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
  $g.FillPath($pgb, $glowPath)

  # perspective lattice
  $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(30, 255, 255, 255), 1)
  for ($x = 0; $x -le $W; $x += 72) { $g.DrawLine($pen, $x, 0, ($x - $W*0.25), $H) }
  for ($y = 0; $y -le $H; $y += 72) { $g.DrawLine($pen, 0, $y, $W, ($y - $H*0.12)) }

  # frame
  $penF = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(80, $AccentR, $AccentG, $AccentB), 2)
  $m = 26
  $g.DrawRectangle($penF, $m, $m, $W - 2*$m, $H - 2*$m)

  # wordmark + subline
  $fBig = New-Object System.Drawing.Font("Segoe UI", [single]($H*0.085), [System.Drawing.FontStyle]::Bold)
  $fSmall = New-Object System.Drawing.Font("Segoe UI", [single]($H*0.030), [System.Drawing.FontStyle]::Regular)
  $dim = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(185, 235, 235, 240))
  $g.DrawString($Label, $fBig, [System.Drawing.Brushes]::White, 58, ($H - $H*0.31))
  $g.DrawString($Sub, $fSmall, $dim, 60, ($H - $H*0.185))

  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq 'image/jpeg' }
  $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
    [System.Drawing.Imaging.Encoder]::Quality, [long]88)
  $path = Join-Path $outDir $Name
  $bmp.Save($path, $codec, $ep)
  $g.Dispose(); $bmp.Dispose()
  Write-Host "wrote $path"
}

New-Art -Name 'forge-hero.jpg'       -W 1200 -H 630  -Label 'ORR TECHNOLOGIES' -Sub 'AI B2B website engineering - fixed price, settled in Bitcoin' -AccentR 244 -AccentG 162 -AccentB 89
New-Art -Name 'showcase-lattice.jpg' -W 1600 -H 1000 -Label 'LATTICE' -Sub 'Structured product data at catalogue scale' -AccentR 244 -AccentG 162 -AccentB 89
New-Art -Name 'showcase-resin.jpg'   -W 1600 -H 1000 -Label 'RESIN'   -Sub 'Configurator and quoting, plant-floor tough' -AccentR 232 -AccentG 122 -AccentB 74
New-Art -Name 'showcase-vault.jpg'   -W 1600 -H 1000 -Label 'VAULT'   -Sub 'Compliance-ready interfaces for regulated teams' -AccentR 154 -AccentG 130 -AccentB 255
New-Art -Name 'showcase-ribbon.jpg'  -W 1600 -H 1000 -Label 'RIBBON'  -Sub 'One coherent interface across 2,300 SKUs' -AccentR 122 -AccentG 200 -AccentB 168
