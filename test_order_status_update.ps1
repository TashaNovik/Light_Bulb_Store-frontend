# Test order status update endpoint with comprehensive documentation
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "=== UPDATE ORDER STATUS ENDPOINT TESTING ===" -ForegroundColor Green
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
      # Step 2: Define available order statuses (from system configuration)
    Write-Host "`n2. Available order statuses (from system configuration)..." -ForegroundColor Yellow
    $statuses = @(
        @{ id = "f7661699-0081-4b93-b227-f51c2a188936"; code = "NEW"; name = "Новый"; description = "Заказ создан" },
        @{ id = "d5ee11b3-2dc2-4eeb-81fd-ebeeb7fa35cd"; code = "PENDING_PAYMENT"; name = "Ожидает оплаты"; description = "Заказ ожидает подтверждения оплаты" },
        @{ id = "e87d2783-d80f-4a42-a7e4-a7302f6b7510"; code = "PROCESSING"; name = "В обработке"; description = "Заказ принят к обработке" },
        @{ id = "823f3c37-200e-4a7c-9466-84ea031e3af3"; code = "SHIPPED"; name = "Отправлен"; description = "Заказ отправлен" },
        @{ id = "823d75db-b9c6-4f58-a2f0-1bbc294cc910"; code = "DELIVERED"; name = "Доставлен"; description = "Заказ доставлен" },
        @{ id = "0a455718-3182-4366-a857-94ada249ed11"; code = "CANCELLED"; name = "Отменен"; description = "Заказ отменен" }
    )
    
    Write-Host "✓ Loaded $($statuses.Count) order statuses:" -ForegroundColor Green
    foreach ($status in $statuses) {
        Write-Host "   - $($status.code): $($status.name) (ID: $($status.id))" -ForegroundColor Cyan
    }
    
    # Step 3: Get list of orders
    Write-Host "`n3. Getting orders list..." -ForegroundColor Yellow
    try {
        $ordersResponse = Invoke-WebRequest -Uri "http://localhost:8002/admin/orders" -Method GET -Headers $authHeaders
        $ordersData = $ordersResponse.Content | ConvertFrom-Json
        
        if ($ordersData.data -and $ordersData.data.Count -gt 0) {
            $order = $ordersData.data[0]
            $orderId = $order.id
            Write-Host "✓ Found $($ordersData.data.Count) orders. Using order: $($order.order_number) (ID: $orderId)" -ForegroundColor Green
            Write-Host "   Current status: $($order.status_name)" -ForegroundColor Cyan
            
            # Step 4: Demonstrate status update examples
            Write-Host "`n4. Demonstrating UPDATE ORDER STATUS endpoint..." -ForegroundColor Yellow
            Write-Host ""
            
            # Print comprehensive documentation
            Write-Host "=== UPDATE ORDER STATUS ENDPOINT DOCUMENTATION ===" -ForegroundColor Magenta
            Write-Host ""
            Write-Host "Endpoint: PUT /admin/orders/{order_id}/status (через admin service)" -ForegroundColor White
            Write-Host "Direct endpoint: PATCH /api/v1/orders/{order_id}/status (order service)" -ForegroundColor White
            Write-Host ""
            
            Write-Host "REQUEST BODY SCHEMA (OrderStatusUpdate):" -ForegroundColor White
            Write-Host @"
{
  "status_id": "UUID4 (required)",
  "actor_details": "string (optional)",
  "notes": "string (optional)"
}
"@ -ForegroundColor Gray
            
            Write-Host "`nAVAILABLE ORDER STATUSES:" -ForegroundColor White
            foreach ($status in $statuses) {
                Write-Host @"
{
  "id": "$($status.id)",
  "code": "$($status.code)",
  "name": "$($status.name)",
  "description": "$($status.description)"
}
"@ -ForegroundColor Gray
                Write-Host ""
            }
            
            Write-Host "EXAMPLE REQUEST BODIES:" -ForegroundColor White
            Write-Host ""
            
            # Find specific statuses for examples
            $shippedStatus = $statuses | Where-Object { $_.code -eq "SHIPPED" }
            $deliveredStatus = $statuses | Where-Object { $_.code -eq "DELIVERED" }
            $cancelledStatus = $statuses | Where-Object { $_.code -eq "CANCELLED" }
            
            if ($shippedStatus) {
                Write-Host "1. Update to 'Shipped' status:" -ForegroundColor Yellow
                Write-Host @"
{
  "status_id": "$($shippedStatus.id)",
  "actor_details": "Admin: admin@lightbulbstore.com",
  "notes": "Заказ передан в службу доставки. Трек-номер: RU123456789"
}
"@ -ForegroundColor Gray
                Write-Host ""
            }
            
            if ($deliveredStatus) {
                Write-Host "2. Update to 'Delivered' status:" -ForegroundColor Yellow
                Write-Host @"
{
  "status_id": "$($deliveredStatus.id)",
  "actor_details": "System: Delivery confirmation",
  "notes": "Заказ успешно доставлен и получен клиентом"
}
"@ -ForegroundColor Gray
                Write-Host ""
            }
            
            if ($cancelledStatus) {
                Write-Host "3. Cancel order:" -ForegroundColor Yellow
                Write-Host @"
{
  "status_id": "$($cancelledStatus.id)",
  "actor_details": "Admin: customer_service",
  "notes": "Отменено по запросу клиента. Возврат средств в течение 3-5 рабочих дней"
}
"@ -ForegroundColor Gray
                Write-Host ""
            }
            
            Write-Host "4. Minimal request (only required fields):" -ForegroundColor Yellow
            if ($shippedStatus) {
                Write-Host @"
{
  "status_id": "$($shippedStatus.id)"
}
"@ -ForegroundColor Gray
            }
            Write-Host ""
            
            Write-Host "FIELD DESCRIPTIONS:" -ForegroundColor White
            Write-Host "• status_id (required): UUID of the new order status" -ForegroundColor Gray
            Write-Host "• actor_details (optional): Information about who made the change" -ForegroundColor Gray
            Write-Host "• notes (optional): Additional comments about the status change" -ForegroundColor Gray
            Write-Host ""
            
            Write-Host "TESTING NOTES:" -ForegroundColor White
            Write-Host "• Authentication required: You need to authenticate with admin credentials first" -ForegroundColor Gray
            Write-Host "• Order ID: Replace {order_id} in URL with actual order UUID" -ForegroundColor Gray
            Write-Host "• Status history: Each status change creates a record in order_status_history table" -ForegroundColor Gray
            Write-Host "• Response: Returns full order details with updated status" -ForegroundColor Gray
            Write-Host ""
            
            # Step 5: Test actual status update
            Write-Host "5. Testing actual status update..." -ForegroundColor Yellow
            
            # Find a safe status to test (prefer SHIPPED if available)
            $testStatus = $shippedStatus
            if (-not $testStatus -and $statuses.Count -gt 0) {
                $testStatus = $statuses[0]
            }
            
            if ($testStatus) {
                $updateData = @{
                    status_id = $testStatus.id
                    actor_details = "PowerShell Test Script"
                    notes = "Тестовое обновление статуса заказа через PowerShell скрипт"
                } | ConvertTo-Json
                
                Write-Host "Attempting to update order $orderId to status: $($testStatus.name)" -ForegroundColor Cyan
                Write-Host "Request body: $updateData" -ForegroundColor Gray
                
                try {
                    $updateResponse = Invoke-WebRequest -Uri "http://localhost:8002/admin/orders/$orderId/status" -Method PUT -Body $updateData -Headers $authHeaders
                    $updatedOrder = $updateResponse.Content | ConvertFrom-Json
                    Write-Host "✓ Status update successful!" -ForegroundColor Green
                    Write-Host "Response: $($updateResponse.Content)" -ForegroundColor Gray
                    
                    # Step 6: Verify status history
                    Write-Host "`n6. Checking status history..." -ForegroundColor Yellow
                    try {
                        $historyResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/orders/$orderId/history" -Method GET -Headers @{"Content-Type"="application/json"}
                        $history = $historyResponse.Content | ConvertFrom-Json
                        Write-Host "✓ Status history retrieved. Found $($history.Count) status changes:" -ForegroundColor Green
                        foreach ($historyItem in $history) {
                            Write-Host "   - Changed to: $($historyItem.status_name) at $($historyItem.changed_at)" -ForegroundColor Cyan
                            if ($historyItem.actor_details) {
                                Write-Host "     Actor: $($historyItem.actor_details)" -ForegroundColor Gray
                            }
                            if ($historyItem.notes) {
                                Write-Host "     Notes: $($historyItem.notes)" -ForegroundColor Gray
                            }
                        }
                    } catch {
                        Write-Host "✗ Error getting status history: $($_.Exception.Message)" -ForegroundColor Red
                    }
                    
                } catch {
                    Write-Host "✗ Status update failed: $($_.Exception.Message)" -ForegroundColor Red
                    if ($_.Exception.Response) {
                        $errorStream = $_.Exception.Response.GetResponseStream()
                        $reader = New-Object System.IO.StreamReader($errorStream)
                        $errorContent = $reader.ReadToEnd()
                        Write-Host "Error details: $errorContent" -ForegroundColor Red
                    }
                }
            } else {
                Write-Host "✗ No suitable status found for testing" -ForegroundColor Red
            }
            
        } else {
            Write-Host "✗ No orders found to test with" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "✗ Error getting orders: $($_.Exception.Message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== TEST COMPLETED ===" -ForegroundColor Green
