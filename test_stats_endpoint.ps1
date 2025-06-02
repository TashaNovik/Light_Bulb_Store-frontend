# Test the /orders/stats endpoint to confirm the 422 error
Write-Host "=== TESTING /orders/stats ENDPOINT ===" -ForegroundColor Green

# Test 1: Direct order service call (should fail - endpoint doesn't exist)
Write-Host "`n1. Testing direct order service /api/v1/orders/stats..." -ForegroundColor Yellow
try {
    $directResponse = Invoke-RestMethod -Uri "http://localhost:8001/api/v1/orders/stats" -Method GET
    Write-Host "✓ Direct call successful: $directResponse" -ForegroundColor Green
} catch {
    Write-Host "✗ Direct call failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "   Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    }
}

# Test 2: Admin service proxy call (should also fail because it calls the missing endpoint)
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
    $adminResponse = Invoke-RestMethod -Uri "http://localhost:8002/admin/orders/stats" -Method GET -Headers $authHeaders
    Write-Host "✓ Admin service call successful: $adminResponse" -ForegroundColor Green
} catch {
    Write-Host "✗ Admin service call failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "   Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    }
}

Write-Host "`n=== CONCLUSION ===" -ForegroundColor Green
Write-Host "The /orders/stats endpoint is missing from the order service!" -ForegroundColor Yellow
Write-Host "Need to implement this endpoint to fix the 422 error." -ForegroundColor Yellow
