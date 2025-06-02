# Test script for orders endpoint through admin service
$baseUrl = "http://localhost:8002"

Write-Host "Testing GET /admin/orders endpoint..." -ForegroundColor Green

# Step 1: Login to get access token
Write-Host "`n1. Logging in..." -ForegroundColor Yellow
$loginData = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login-json" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "Login successful!" -ForegroundColor Green
    $token = $loginResponse.access_token
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Test orders endpoint
Write-Host "`n2. Testing GET /admin/orders..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/admin/orders" -Method GET -Headers $headers
    Write-Host "Response Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response Headers:" -ForegroundColor Cyan
    $response.Headers | Format-Table
    
    if ($response.StatusCode -eq 200) {
        $orders = $response.Content | ConvertFrom-Json
        Write-Host "Orders retrieved successfully!" -ForegroundColor Green
        Write-Host "Number of orders: $($orders.Length)" -ForegroundColor Green
    }
} catch {
    Write-Host "Request failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    }
}

# Step 3: Test direct order service endpoint for comparison
Write-Host "`n3. Testing direct order service endpoint..." -ForegroundColor Yellow
try {
    $directResponse = Invoke-WebRequest -Uri "http://localhost:8001/api/v1/orders/" -Method GET
    Write-Host "Direct order service Status Code: $($directResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Direct order service failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Step 4: Test without trailing slash
Write-Host "`n4. Testing direct order service without trailing slash..." -ForegroundColor Yellow
try {
    $directResponse2 = Invoke-WebRequest -Uri "http://localhost:8001/api/v1/orders" -Method GET
    Write-Host "Direct order service (no slash) Status Code: $($directResponse2.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Direct order service (no slash) failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    }
}

Write-Host "`nTest completed!" -ForegroundColor Green
