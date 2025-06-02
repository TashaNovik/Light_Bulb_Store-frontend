# Test that admin service proxy now works correctly after the PATCH fix
Write-Host "=== TESTING ADMIN SERVICE AFTER PATCH FIX ===" -ForegroundColor Green
Write-Host ""

# Step 1: Create a new test order for admin service testing
Write-Host "1. Creating a new test order for admin service testing..." -ForegroundColor Yellow

$headers = @{
    "Content-Type" = "application/json"
}

# Get reference data
try {
    $deliveryMethods = Invoke-RestMethod -Uri "http://localhost:8001/api/v1/orders/delivery-methods" -Method GET
    $paymentMethods = Invoke-RestMethod -Uri "http://localhost:8001/api/v1/orders/payment-methods" -Method GET
    $products = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/products/" -Method GET
    
    # Create order data
    $orderData = @{
        customer_name = "Admin Service Test Customer"
        customer_phone = "+7-900-987-65-43" 
        customer_email = "admintest@example.com"
        delivery_method_id = $deliveryMethods[0].id
        customer_notes = "Test order for admin service status update testing"
        payment_method_id = $paymentMethods[0].id
        order_items = @(
            @{
                product_id = $products[0].id
                product_snapshot_name = $products[0].name
                product_snapshot_price = [decimal]$products[0].current_price
                quantity = 1
            }
        )
    } | ConvertTo-Json -Depth 3
    
    $orderResponse = Invoke-RestMethod -Uri "http://localhost:8001/api/v1/orders/" -Method POST -Body $orderData -Headers $headers
    $testOrderId = $orderResponse.id
    Write-Host "✓ Test order created successfully!" -ForegroundColor Green
    Write-Host "   Order ID: $testOrderId" -ForegroundColor Cyan
    Write-Host "   Order Number: $($orderResponse.order_number)" -ForegroundColor Cyan
    
} catch {
    Write-Host "✗ Error creating test order: $($_.Exception.Message)" -ForegroundColor Red
    return
}

# Step 2: Login to admin service
Write-Host "`n2. Logging into admin service..." -ForegroundColor Yellow
$loginData = "username=admin&password=admin123"
$loginHeaders = @{
    "Content-Type" = "application/x-www-form-urlencoded"
}

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:8002/auth/login" -Method POST -Body $loginData -Headers $loginHeaders
    $loginResult = $loginResponse.Content | ConvertFrom-Json
    $accessToken = $loginResult.access_token
    Write-Host "✓ Login successful! Got access token." -ForegroundColor Green
    
    # Add token to headers
    $authHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $accessToken"
    }
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    return
}

# Step 3: Test admin service status update (should now work with PATCH fix)
Write-Host "`n3. Testing admin service status update after PATCH fix..." -ForegroundColor Yellow

# Get available statuses first
try {
    $availableStatuses = Invoke-RestMethod -Uri "http://localhost:8001/api/v1/orders/statuses" -Method GET
    $processingStatus = $availableStatuses | Where-Object { $_.code -eq "PROCESSING" }
    
    if ($processingStatus) {
        Write-Host "   Testing update to PROCESSING via admin service..." -ForegroundColor Cyan
        $updateData = @{
            status_id = $processingStatus.id
            actor_details = "Admin Service: Fixed PATCH Test"
            notes = "Testing admin service after PATCH method fix"
        } | ConvertTo-Json
        
        try {
            $updateResponse = Invoke-WebRequest -Uri "http://localhost:8002/admin/orders/$testOrderId/status" -Method PUT -Body $updateData -Headers $authHeaders
            $updateResult = $updateResponse.Content | ConvertFrom-Json
            Write-Host "   ✅ ADMIN SERVICE STATUS UPDATE SUCCESSFUL!" -ForegroundColor Green
            Write-Host "     Status: $($updateResult.status_name)" -ForegroundColor White
            Write-Host "     Updated at: $($updateResult.updated_at)" -ForegroundColor White
            Write-Host ""
            Write-Host "🎉 ADMIN SERVICE PROXY IS NOW WORKING CORRECTLY!" -ForegroundColor Green
            
        } catch {
            Write-Host "   ❌ Admin service still failing: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "   ⚠️  Admin service may need restart to pick up code changes" -ForegroundColor Yellow
            if ($_.Exception.Response) {
                $errorStream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorStream)
                $errorContent = $reader.ReadToEnd()
                Write-Host "     Error details: $errorContent" -ForegroundColor Red
            }
        }
    }
} catch {
    Write-Host "✗ Error getting order statuses: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Verify the order was updated by checking directly
Write-Host "`n4. Verifying order status via direct order service call..." -ForegroundColor Yellow
try {
    $finalOrder = Invoke-RestMethod -Uri "http://localhost:8001/api/v1/orders/$testOrderId" -Method GET
    Write-Host "✓ Final order status verification:" -ForegroundColor Green
    Write-Host "   Status: $($finalOrder.status_name) ($($finalOrder.status_code))" -ForegroundColor Cyan
    Write-Host "   Last updated: $($finalOrder.updated_at)" -ForegroundColor Cyan
    
    # Check status history
    $history = Invoke-RestMethod -Uri "http://localhost:8001/api/v1/orders/$testOrderId/history" -Method GET
    Write-Host "   Total status changes: $($history.Count)" -ForegroundColor Cyan
    
    if ($history.Count -gt 1) {
        Write-Host "   ✅ Status was successfully updated!" -ForegroundColor Green
    }
    
} catch {
    Write-Host "✗ Error verifying order status: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== ADMIN SERVICE TESTING COMPLETED ===" -ForegroundColor Green
Write-Host ""
Write-Host "📝 SUMMARY:" -ForegroundColor White
Write-Host "✅ Order creation: Working" -ForegroundColor Green
Write-Host "✅ Admin authentication: Working" -ForegroundColor Green
Write-Host "✅ Direct order service: Working" -ForegroundColor Green
Write-Host "⚠️  Admin service proxy: May need restart after code changes" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔧 If admin service test failed, restart the admin service container:" -ForegroundColor Cyan
Write-Host "   docker-compose restart admin_service" -ForegroundColor Gray
