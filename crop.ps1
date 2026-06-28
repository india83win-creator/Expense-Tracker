Add-Type -AssemblyName System.Drawing
$srcPath = 'C:\Users\Dhananjay\.gemini\antigravity-ide\brain\b563bfc0-5435-4f6a-9e87-d0d5b7812cb8\ml_arrow_icon_1782685382949.png'
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
$cropSize = [int]($bmp.Width * 0.08)
$rect = New-Object System.Drawing.Rectangle($cropSize, $cropSize, ($bmp.Width - $cropSize * 2), ($bmp.Height - $cropSize * 2))
$croppedBmp = $bmp.Clone($rect, $bmp.PixelFormat)
$resized512 = New-Object System.Drawing.Bitmap($croppedBmp, 512, 512)
$resized512.Save('c:\Users\Dhananjay\MY PROJECTS\expense-tracker\frontend\public\icon-512x512.png', [System.Drawing.Imaging.ImageFormat]::Png)
$resized192 = New-Object System.Drawing.Bitmap($croppedBmp, 192, 192)
$resized192.Save('c:\Users\Dhananjay\MY PROJECTS\expense-tracker\frontend\public\icon-192x192.png', [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$croppedBmp.Dispose()
$resized512.Dispose()
$resized192.Dispose()
