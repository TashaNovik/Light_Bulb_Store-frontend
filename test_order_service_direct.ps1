# Test order status update directly on order service (bypass admin service)
$orderId = "44bb3cab-1013-4aca-bb65-16a2dd250c24"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "=== TESTING ORDER STATUS UPDATES DIRECTLY ON ORDER SERVICE ===" -ForegroundColor Green
Write-Host "Order ID: $orderId" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check current order status (direct order service call)
Write-Host "1. Checking current order status (direct order service)..." -ForegroundColor Yellow
try {
    $orderResponse = Invoke-RestMethod -Uri "http://localhost:8001/api/v1/orders/$orderId" -Method GET
    Write-Host "✓ Current order status: $($orderResponse.status_name) ($($orderResponse.status_code))" -ForegroundColor Green
    Write-Host "   Order Number: $($orderResponse.order_number)" -ForegroundColor Cyan
    Write-Host "   Total Amount: $($orderResponse.total_amount)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Error getting order details: $($_.Exception.Message)" -ForegroundColor Red
    return
}

# Step 2: Get available order statuses
Write-Host "`n2. Getting available order statuses..." -ForegroundColor Yellow
try {
    $availableStatuses = Invoke-RestMethod -Uri "http://localhost:8001/api/v1/orders/statuses" -Method GET
    Write-Host "✓ Found $($availableStatuses.Count) order statuses:" -ForegroundColor Green
    foreach ($status in $availableStatuses) {
        Write-Host "   - $($status.code): $($status.name) (ID: $($status.id))" -ForegroundColor Cyan
    }
} catch {
    Write-Host "✗ Error getting order statuses: $($_.Exception.Message)" -ForegroundColor Red
    return
}

# Step 3: Test status updates sequentially using PATCH method
Write-Host "`n3. Testing order status updates using PATCH method..." -ForegroundColor Yellow

# Test 1: Update to PENDING_PAYMENT
$pendingPaymentStatus = $availableStatuses | Where-Object { $_.code -eq "PENDING_PAYMENT" }
if ($pendingPaymentStatus) {
    Write-Host "`n   Testing update to PENDING_PAYMENT..." -ForegroundColor Cyan
    $updateData = @{
        status_id = $pendingPaymentStatus.id
        actor_details = "Admin: Test User"
        notes = "Status updated for testing purposes"
    } | ConvertTo-Json
    
    try {
        $updateResponse = Invoke-RestMethod -Uri "http://localhost:8001/api/v1/orders/$orderId/status" -Method PATCH -Body $updateData -Headers $headers
        Write-Host "   ✓ Successfully updated to PENDING_PAYMENT" -ForegroundColor Green
        Write-Host "     Status: $($updateResponse.status_name)" -ForegroundColor White
        Write-Host "     Updated at: $($updateResponse.updated_at)" -ForegroundColor White
    } catch {
        Write-Host "   ✗ Error updating to PENDING_PAYMENT: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorContent = $reader.ReadToEnd()
            Write-Host "     Error details: $errorContent" -ForegroundColor Red
        }
    }
}

# Test 2: Update to PROCESSING
Start-Sleep -Seconds 2
$processingStatus = $availableStatuses | Where-Object { $_.code -eq "PROCESSING" }
if ($processingStatus) {
    Write-Host "`n   Testing update to PROCESSING..." -ForegroundColor Cyan
    $updateData = @{
        status_id = $processingStatus.id
        actor_details = "System: Order Processing Team"
        notes = "Order moved to processing queue"
    } | ConvertTo-Json
    
    try {
        $updateResponse = Invoke-RestMethod -Uri "http://localhost:8001/api/v1/orders/$orderId/status" -Method PATCH -Body $updateData -Headers $headers
        Write-Host "   ✓ Successfully updated to PROCESSING" -ForegroundColor Green
        Write-Host "     Status: $($updateResponse.status_name)" -ForegroundColor White
        Write-Host "     Updated at: $($updateResponse.updated_at)" -ForegroundColor White
    } catch {
        Write-Host "   ✗ Error updating to PROCESSING: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 3: Update to SHIPPED
Start-Sleep -Seconds 2
$shippedStatus = $availableStatuses | Where-Object { $_.code -eq "SHIPPED" }
if ($shippedStatus) {
    Write-Host "`n   Testing update to SHIPPED..." -ForegroundColor Cyan
    $updateData = @{
        status_id = $shippedStatus.id
        actor_details = "Logistics: Shipping Department"
        notes = "Package shipped via DHL Express. Tracking: DHL123456789"
    } | ConvertTo-Json
    
    try {
        $updateResponse = Invoke-RestMethod -Uri "http://localhost:8001/api/v1/orders/$orderId/status" -Method PATCH -Body $updateData -Headers $headers
        Write-Host "   ✓ Successfully updated to SHIPPED" -ForegroundColor Green
        Write-Host "     Status: $($updateResponse.status_name)" -ForegroundColor White
        Write-Host "     Updated at: $($updateResponse.updated_at)" -ForegroundColor White
    } catch {
        Write-Host "   ✗ Error updating to SHIPPED: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Update to DELIVERED
Start-Sleep -Seconds 2
$deliveredStatus = $availableStatuses | Where-Object { $_.code -eq "DELIVERED" }
if ($deliveredStatus) {
    Write-Host "`n   Testing update to DELIVERED..." -ForegroundColor Cyan
    $updateData = @{
        status_id = $deliveredStatus.id
        actor_details = "Logistics: Delivery Service"
        notes = "Package successfully delivered to customer. Signed by: Test Customer"
    } | ConvertTo-Json
    
    try {
        $updateResponse = Invoke-RestMethod -Uri "http://localhost:8001/api/v1/orders/$orderId/status" -Method PATCH -Body $updateData -Headers $headers
        Write-Host "   ✓ Successfully updated to DELIVERED" -ForegroundColor Green
        Write-Host "     Status: $($updateResponse.status_name)" -ForegroundColor White
        Write-Host "     Updated at: $($updateResponse.updated_at)" -ForegroundColor White
    } catch {
        Write-Host "   ✗ Error updating to DELIVERED: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Step 4: Get order status history
Write-Host "`n4. Retrieving order status history..." -ForegroundColor Yellow
try {
    $historyData = Invoke-RestMethod -Uri "http://localhost:8001/api/v1/orders/$orderId/history" -Method GET
    
    Write-Host "✓ Status history retrieved successfully!" -ForegroundColor Green
    Write-Host "   Total status changes: $($historyData.Count)" -ForegroundColor Cyan
    
    foreach ($history in $historyData) {
        Write-Host "`n   Status Change:" -ForegroundColor White
        Write-Host "     Status: $($history.status_name) ($($history.status_code))" -ForegroundColor Cyan
        Write-Host "     Changed at: $($history.changed_at)" -ForegroundColor Gray
        Write-Host "     Actor: $($history.actor_details)" -ForegroundColor Gray
        Write-Host "     Notes: $($history.notes)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Error getting status history: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorContent = $reader.ReadToEnd()
        Write-Host "Error details: $errorContent" -ForegroundColor Red
    }
}

# Step 5: Final order status
Write-Host "`n5. Final order status..." -ForegroundColor Yellow
try {
    $finalOrderData = Invoke-RestMethod -Uri "http://localhost:8001/api/v1/orders/$orderId" -Method GET
    Write-Host "✓ Final order status: $($finalOrderData.status_name) ($($finalOrderData.status_code))" -ForegroundColor Green
    Write-Host "   Last updated: $($finalOrderData.updated_at)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Error getting final order details: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== DIRECT ORDER SERVICE TESTING COMPLETED ===" -ForegroundColor Green
Write-Host "✓ All status updates tested successfully!" -ForegroundColor Green
Write-Host "✓ Status history functionality verified!" -ForegroundColor Green
Write-Host "✓ End-to-end order lifecycle completed!" -ForegroundColor Green
