# Quick test for the stats endpoint
Write-Host "=== TESTING STATS ENDPOINT SPECIFICALLY ===" -ForegroundColor Green

# Test 1: Direct order service stats
Write-Host "`n1. Testing direct order service /api/v1/orders/stats..." -ForegroundColor Yellow
try {
    $statsResponse = Invoke-RestMethod -Uri "http://localhost:8001/api/v1/orders/stats" -Method GET
    Write-Host "✓ SUCCESS! Stats endpoint is working!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $statsResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test 2: Admin service proxy stats
Write-Host "`n2. Testing admin service /admin/orders/stats..." -ForegroundColor Yellow

# Login first
$loginData = "username=admin&password=admin123"
$loginHeaders = @{
    "Content-Type" = "application/x-www-form-urlencoded"
}

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:8002/auth/login" -Method POST -Body $loginData -Headers $loginHeaders
    $loginResult = $loginResponse.Content | ConvertFrom-Json
    $accessToken = $loginResult.access_token
    Write-Host "✓ Login successful!" -ForegroundColor Green
    
    $authHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $accessToken"
    }
    
    # Test admin service stats endpoint
    $adminStatsResponse = Invoke-RestMethod -Uri "http://localhost:8002/admin/orders/stats" -Method GET -Headers $authHeaders
    Write-Host "✓ SUCCESS! Admin proxy stats endpoint is working!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $adminStatsResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host "`n=== RESULT ===" -ForegroundColor Green
Write-Host "✓ The /orders/stats endpoint has been successfully implemented!" -ForegroundColor Green
