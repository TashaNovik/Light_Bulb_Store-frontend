#!/usr/bin/env pwsh
# Test script to delete product through admin service

Write-Host "Testing delete product through admin service..." -ForegroundColor Green

try {
    # 1. Get authentication token
    Write-Host "1. Getting authentication token..." -ForegroundColor Yellow
    $loginData = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8002/auth/login-json" -Method Post -ContentType "application/json" -Body $loginData
    $token = $loginResponse.access_token
    Write-Host "Token received successfully" -ForegroundColor Green

    # 2. Get products to find one to delete
    Write-Host "2. Getting products through admin service..." -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $products = Invoke-RestMethod -Uri "http://localhost:8002/admin/products" -Method Get -Headers $headers
    Write-Host "Got $($products.Count) products through admin service." -ForegroundColor Green

    if ($products.Count -eq 0) {
        Write-Host "No products found to delete" -ForegroundColor Yellow
        exit 0
    }

    # Get the last product (likely our test product)
    $productToDelete = $products[-1]
    Write-Host "Will try to delete product: $($productToDelete.name) (ID: $($productToDelete.id))" -ForegroundColor Yellow

    # 3. Delete the product through admin service
    Write-Host "3. Deleting product through admin service..." -ForegroundColor Yellow
    $deleteUrl = "http://localhost:8002/admin/products/$($productToDelete.id)"
    Write-Host "DELETE URL: $deleteUrl" -ForegroundColor Cyan

    try {
        $deleteResponse = Invoke-RestMethod -Uri $deleteUrl -Method Delete -Headers $headers
        Write-Host "Product deleted successfully through admin service!" -ForegroundColor Green
        Write-Host "Response: $($deleteResponse | ConvertTo-Json)" -ForegroundColor Gray
    }
    catch {
        Write-Host "Error deleting product through admin service:" -ForegroundColor Red
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
        
        # Try to get the response content
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseContent = $reader.ReadToEnd()
            Write-Host "Response Content: $responseContent" -ForegroundColor Red
        }
        catch {
            Write-Host "Could not read response content" -ForegroundColor Red
        }
    }

    # 4. Verify deletion by trying to get the product
    Write-Host "4. Verifying deletion..." -ForegroundColor Yellow
    try {
        $getResponse = Invoke-RestMethod -Uri $deleteUrl -Method Get -Headers $headers
        Write-Host "WARNING: Product still exists after deletion!" -ForegroundColor Red
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host "Confirmed: Product was successfully deleted (404 Not Found)" -ForegroundColor Green
        }
        else {
            Write-Host "Unexpected error when verifying deletion: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }

}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack Trace: $($_.Exception.StackTrace)" -ForegroundColor Red
}

Write-Host "Test completed." -ForegroundColor Green
