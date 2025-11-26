# Push changes to GitHub for Vercel deployment
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Git Push Script for Vercel Deploy" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Change to project directory
Set-Location "c:\Users\user\Downloads\Secure-You-main\Secure-You-main"

Write-Host "Current directory:" -ForegroundColor Yellow
Get-Location
Write-Host ""

Write-Host "Checking git status..." -ForegroundColor Yellow
git status
Write-Host ""

Write-Host "Recent commits:" -ForegroundColor Yellow
git log --oneline -5
Write-Host ""

Write-Host "Pushing to origin main..." -ForegroundColor Green
git push origin main
Write-Host ""

Write-Host "Verifying remote status..." -ForegroundColor Yellow
git remote -v
Write-Host ""

Write-Host "==================================" -ForegroundColor Green
Write-Host "Push complete! Check Vercel dashboard for deployment." -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
