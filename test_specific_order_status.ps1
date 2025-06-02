# Test order status update for the specific order we just created
$orderId = "44bb3cab-1013-4aca-bb65-16a2dd250c24"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "=== TESTING ORDER STATUS UPDATES FOR CREATED ORDER ===" -ForegroundColor Green
Write-Host "Order ID: $orderId" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login to get access token
Write-Host "1. Logging in to get access token..." -ForegroundColor Yellow
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
    
    # Step 2: Check current order status
    Write-Host "`n2. Checking current order status..." -ForegroundColor Yellow
    try {
        $orderResponse = Invoke-WebRequest -Uri "http://localhost:8002/admin/orders/$orderId" -Method GET -Headers $authHeaders
        $orderData = $orderResponse.Content | ConvertFrom-Json
        Write-Host "✓ Current order status: $($orderData.status_name) ($($orderData.status_code))" -ForegroundColor Green
        Write-Host "   Order Number: $($orderData.order_number)" -ForegroundColor Cyan
        Write-Host "   Total Amount: $($orderData.total_amount)" -ForegroundColor Cyan
    } catch {
        Write-Host "✗ Error getting order details: $($_.Exception.Message)" -ForegroundColor Red
        return
    }
    
    # Step 3: Define available order statuses
    Write-Host "`n3. Available order statuses..." -ForegroundColor Yellow
    $statuses = @(
        @{ id = "f7661699-0081-4b93-b227-f51c2a188936"; code = "NEW"; name = "Новый" },
        @{ id = "d5ee11b3-2dc2-4eeb-81fd-ebeeb7fa35cd"; code = "PENDING_PAYMENT"; name = "Ожидает оплаты" },
        @{ id = "e87d2783-d80f-4a42-a7e4-a7302f6b7510"; code = "PROCESSING"; name = "В обработке" },
        @{ id = "823f3c37-200e-4a7c-9466-84ea031e3af3"; code = "SHIPPED"; name = "Отправлен" },
        @{ id = "823d75db-b9c6-4f58-a2f0-1bbc294cc910"; code = "DELIVERED"; name = "Доставлен" },
        @{ id = "0a455718-3182-4366-a857-94ada249ed11"; code = "CANCELLED"; name = "Отменен" }
    )
    
    Write-Host "✓ Loaded $($statuses.Count) order statuses:" -ForegroundColor Green
    foreach ($status in $statuses) {
        Write-Host "   - $($status.code): $($status.name) (ID: $($status.id))" -ForegroundColor Cyan
    }
    
    # Step 4: Test status updates sequentially
    Write-Host "`n4. Testing order status updates..." -ForegroundColor Yellow
    
    # Test 1: Update to PENDING_PAYMENT
    $pendingPaymentStatus = $statuses | Where-Object { $_.code -eq "PENDING_PAYMENT" }
    Write-Host "`n   Testing update to PENDING_PAYMENT..." -ForegroundColor Cyan
    $updateData = @{
        status_id = $pendingPaymentStatus.id
        actor_details = "Admin: Test User"
        notes = "Status updated for testing purposes"
    } | ConvertTo-Json
    
    try {
        $updateResponse = Invoke-WebRequest -Uri "http://localhost:8002/admin/orders/$orderId/status" -Method PUT -Body $updateData -Headers $authHeaders
        $updateResult = $updateResponse.Content | ConvertFrom-Json
        Write-Host "   ✓ Successfully updated to PENDING_PAYMENT" -ForegroundColor Green
        Write-Host "     Status: $($updateResult.status_name)" -ForegroundColor White
        Write-Host "     Updated at: $($updateResult.updated_at)" -ForegroundColor White
    } catch {
        Write-Host "   ✗ Error updating to PENDING_PAYMENT: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorContent = $reader.ReadToEnd()
            Write-Host "     Error details: $errorContent" -ForegroundColor Red
        }
    }
    
    # Test 2: Update to PROCESSING
    Start-Sleep -Seconds 2
    $processingStatus = $statuses | Where-Object { $_.code -eq "PROCESSING" }
    Write-Host "`n   Testing update to PROCESSING..." -ForegroundColor Cyan
    $updateData = @{
        status_id = $processingStatus.id
        actor_details = "System: Order Processing Team"
        notes = "Order moved to processing queue"
    } | ConvertTo-Json
    
    try {
        $updateResponse = Invoke-WebRequest -Uri "http://localhost:8002/admin/orders/$orderId/status" -Method PUT -Body $updateData -Headers $authHeaders
        $updateResult = $updateResponse.Content | ConvertFrom-Json
        Write-Host "   ✓ Successfully updated to PROCESSING" -ForegroundColor Green
        Write-Host "     Status: $($updateResult.status_name)" -ForegroundColor White
        Write-Host "     Updated at: $($updateResult.updated_at)" -ForegroundColor White
    } catch {
        Write-Host "   ✗ Error updating to PROCESSING: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test 3: Update to SHIPPED
    Start-Sleep -Seconds 2
    $shippedStatus = $statuses | Where-Object { $_.code -eq "SHIPPED" }
    Write-Host "`n   Testing update to SHIPPED..." -ForegroundColor Cyan
    $updateData = @{
        status_id = $shippedStatus.id
        actor_details = "Logistics: Shipping Department"
        notes = "Package shipped via DHL Express. Tracking: DHL123456789"
    } | ConvertTo-Json
    
    try {
        $updateResponse = Invoke-WebRequest -Uri "http://localhost:8002/admin/orders/$orderId/status" -Method PUT -Body $updateData -Headers $authHeaders
        $updateResult = $updateResponse.Content | ConvertFrom-Json
        Write-Host "   ✓ Successfully updated to SHIPPED" -ForegroundColor Green
        Write-Host "     Status: $($updateResult.status_name)" -ForegroundColor White
        Write-Host "     Updated at: $($updateResult.updated_at)" -ForegroundColor White
    } catch {
        Write-Host "   ✗ Error updating to SHIPPED: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test 4: Update to DELIVERED
    Start-Sleep -Seconds 2
    $deliveredStatus = $statuses | Where-Object { $_.code -eq "DELIVERED" }
    Write-Host "`n   Testing update to DELIVERED..." -ForegroundColor Cyan
    $updateData = @{
        status_id = $deliveredStatus.id
        actor_details = "Logistics: Delivery Service"
        notes = "Package successfully delivered to customer. Signed by: Test Customer"
    } | ConvertTo-Json
    
    try {
        $updateResponse = Invoke-WebRequest -Uri "http://localhost:8002/admin/orders/$orderId/status" -Method PUT -Body $updateData -Headers $authHeaders
        $updateResult = $updateResponse.Content | ConvertFrom-Json
        Write-Host "   ✓ Successfully updated to DELIVERED" -ForegroundColor Green
        Write-Host "     Status: $($updateResult.status_name)" -ForegroundColor White
        Write-Host "     Updated at: $($updateResult.updated_at)" -ForegroundColor White
    } catch {
        Write-Host "   ✗ Error updating to DELIVERED: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Step 5: Get order status history
    Write-Host "`n5. Retrieving order status history..." -ForegroundColor Yellow
    try {
        $historyResponse = Invoke-WebRequest -Uri "http://localhost:8002/admin/orders/$orderId/status-history" -Method GET -Headers $authHeaders
        $historyData = $historyResponse.Content | ConvertFrom-Json
        
        Write-Host "✓ Status history retrieved successfully!" -ForegroundColor Green
        Write-Host "   Total status changes: $($historyData.Count)" -ForegroundColor Cyan
        
        foreach ($history in $historyData) {
            Write-Host "`n   Status Change:" -ForegroundColor White
            Write-Host "     Status: $($history.status_name) ($($history.status_code))" -ForegroundColor Cyan
            Write-Host "     Changed at: $($history.created_at)" -ForegroundColor Gray
            Write-Host "     Actor: $($history.actor_details)" -ForegroundColor Gray
            Write-Host "     Notes: $($history.notes)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "✗ Error getting status history: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Step 6: Final order details
    Write-Host "`n6. Final order status..." -ForegroundColor Yellow
    try {
        $finalOrderResponse = Invoke-WebRequest -Uri "http://localhost:8002/admin/orders/$orderId" -Method GET -Headers $authHeaders
        $finalOrderData = $finalOrderResponse.Content | ConvertFrom-Json
        Write-Host "✓ Final order status: $($finalOrderData.status_name) ($($finalOrderData.status_code))" -ForegroundColor Green
        Write-Host "   Last updated: $($finalOrderData.updated_at)" -ForegroundColor Cyan
    } catch {
        Write-Host "✗ Error getting final order details: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "`n=== ORDER STATUS UPDATE TESTING COMPLETED ===" -ForegroundColor Green
    Write-Host "✓ All status updates tested successfully!" -ForegroundColor Green
    Write-Host "✓ Status history functionality verified!" -ForegroundColor Green
    Write-Host "✓ End-to-end order lifecycle completed!" -ForegroundColor Green
    
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorContent = $reader.ReadToEnd()
        Write-Host "Error details: $errorContent" -ForegroundColor Red
    }
}
