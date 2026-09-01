param(
    [int]$Port = 8000,
    [switch]$NoBrowser
)

$root = $PSScriptRoot

$mime = @{
    '.html' = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'text/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.md'   = 'text/markdown; charset=utf-8'
    '.svg'  = 'image/svg+xml'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.jfif' = 'image/jpeg'
    '.gif'  = 'image/gif'
    '.webp' = 'image/webp'
    '.ico'  = 'image/x-icon'
    '.woff' = 'font/woff'
    '.woff2'= 'font/woff2'
    '.ttf'  = 'font/ttf'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")

try {
    $listener.Start()
} catch {
    Write-Host "No se pudo abrir el puerto $Port. Proba con otro:  .\serve.ps1 -Port 3000" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "  Sirviendo $root" -ForegroundColor DarkGray
Write-Host "  -> http://localhost:$Port/" -ForegroundColor Green
Write-Host "  -> http://localhost:$Port/?admin=on   (activa el enlace al Panel)" -ForegroundColor Green
Write-Host ""
Write-Host "  Ctrl+C para detener." -ForegroundColor DarkGray
Write-Host ""

if (-not $NoBrowser) { Start-Process "http://localhost:$Port/" }

try {
    while ($listener.IsListening) {
        $context  = $listener.GetContext()
        $request  = $context.Request
        $response = $context.Response

        $relative = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath.TrimStart('/'))
        if ([string]::IsNullOrWhiteSpace($relative)) { $relative = 'index.html' }

        $path = Join-Path $root $relative
        if (Test-Path -LiteralPath $path -PathType Container) {
            $path = Join-Path $path 'index.html'
        }

        $full = [System.IO.Path]::GetFullPath($path)
        if (-not $full.StartsWith([System.IO.Path]::GetFullPath($root), [StringComparison]::OrdinalIgnoreCase)) {
            $full = $null
        }

        if ($full -and (Test-Path -LiteralPath $full -PathType Leaf)) {
            $ext = [System.IO.Path]::GetExtension($full).ToLower()
            $response.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
            $response.StatusCode = 200
            $bytes = [System.IO.File]::ReadAllBytes($full)
            Write-Host ("  200  /{0}" -f $relative) -ForegroundColor DarkGray
        } else {
            $response.StatusCode = 404
            $response.ContentType = 'text/html; charset=utf-8'
            $notFound = Join-Path $root '404.html'
            $bytes = if (Test-Path -LiteralPath $notFound) {
                [System.IO.File]::ReadAllBytes($notFound)
            } else {
                [System.Text.Encoding]::UTF8.GetBytes('404')
            }
            Write-Host ("  404  /{0}" -f $relative) -ForegroundColor Yellow
        }

        $response.Headers.Add('Cache-Control', 'no-store')
        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
        $response.OutputStream.Close()
    }
} finally {
    $listener.Stop()
    $listener.Close()
    Write-Host "`n  Servidor detenido." -ForegroundColor DarkGray
}
