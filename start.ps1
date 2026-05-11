# ==============================================
# Toán Vui - Khởi động + Public URL (ngrok)
# Chạy: powershell -ExecutionPolicy Bypass -File start.ps1
# ==============================================

$webDir = "$PSScriptRoot\web"
$ngrok = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe"

# --- Hàm khởi động Next.js với auto-restart ---
function Start-NextJs {
    Write-Host ">> Khoi dong Next.js..." -ForegroundColor Cyan
    $script:nextJob = Start-Job -Name "nextjs" -ScriptBlock {
        param($dir)
        while ($true) {
            Set-Location $dir
            npm run dev 2>&1
            Write-Host "[Auto-restart] Next.js da thoat, khoi dong lai sau 3 giay..." -ForegroundColor Yellow
            Start-Sleep -Seconds 3
        }
    } -ArgumentList $webDir
}

# Dừng job cũ nếu có
Stop-Job -Name "nextjs" -ErrorAction SilentlyContinue
Remove-Job -Name "nextjs" -ErrorAction SilentlyContinue

Start-NextJs

# Chờ Next.js sẵn sàng
Write-Host ">> Cho Next.js san sang..." -ForegroundColor Yellow
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 2
    try {
        Invoke-WebRequest "http://localhost:3000" -TimeoutSec 2 -ErrorAction Stop | Out-Null
        Write-Host ">> Next.js san sang!" -ForegroundColor Green
        $ready = $true
        break
    } catch {}
}

if (-not $ready) {
    Write-Host ">> Canh bao: Next.js chua san sang sau 60 giay" -ForegroundColor Red
}

Write-Host ""
Write-Host ">> Bat dau ngrok tunnel..." -ForegroundColor Cyan
Write-Host ">> Link public se hien o dong 'Forwarding' ben duoi:" -ForegroundColor Yellow
Write-Host ""

# Giám sát: nếu ngrok thoát thì báo, nếu Next.js thoát thì auto-restart
& $ngrok http 3000
