# Create a test order for testing order status updates
Write-Host "=== CREATING TEST ORDER ===" -ForegroundColor Green

# Login to get token
$loginData = "username=admin&password=admin123"
$loginHeaders = @{
    "Content-Type" = "application/x-www-form-urlencoded"
}

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:8002/auth/login" -Method POST -Body $loginData -Headers $loginHeaders
    $loginResult = $loginResponse.Content | ConvertFrom-Json
    $accessToken = $loginResult.access_token
    Write-Host "✓ Login successful!" -ForegroundColor Green
    
    # Create order through order service
    $orderData = @{
        customer_name = "Test Customer"
        customer_phone = "+7-900-123-45-67"
        customer_email = "test@example.com"
        delivery_method_id = "d5ee11b3-2dc2-4eeb-81fd-ebeeb7fa35cd"  # Random UUID - will need to check actual delivery methods
        payment_method_id = "e87d2783-d80f-4a42-a7e4-a7302f6b7510"   # Random UUID - will need to check actual payment methods
        customer_notes = "Test order for status update testing"
        order_items = @(
            @{
                product_id = "aa1d0163-72a1-444e-a63e-a1890ebaed6a"  # First product from our list
                quantity = 2
            }
        )
    } | ConvertTo-Json -Depth 3
    
    Write-Host "Creating test order..." -ForegroundColor Yellow
    Write-Host "Order data: $orderData" -ForegroundColor Gray
      $headers = @{
        "Content-Type" = "application/json"
    }
    
    # First, let's get delivery and payment methods
    Write-Host "`nGetting delivery methods..." -ForegroundColor Yellow
    try {
        $deliveryMethods = Invoke-RestMethod -Uri "http://localhost:8001/api/v1/orders/delivery-methods" -Method GET
        Write-Host "✓ Found $($deliveryMethods.Count) delivery methods" -ForegroundColor Green
        $deliveryMethods | ForEach-Object { Write-Host "   - $($_.code): $($_.name) (ID: $($_.id))" -ForegroundColor Cyan }
    } catch {
        Write-Host "✗ Error getting delivery methods: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "`nGetting payment methods..." -ForegroundColor Yellow
    try {
        $paymentMethods = Invoke-RestMethod -Uri "http://localhost:8001/api/v1/orders/payment-methods" -Method GET
        Write-Host "✓ Found $($paymentMethods.Count) payment methods" -ForegroundColor Green
        $paymentMethods | ForEach-Object { Write-Host "   - $($_.code): $($_.name) (ID: $($_.id))" -ForegroundColor Cyan }
    } catch {
        Write-Host "✗ Error getting payment methods: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Use actual method IDs if available
    if ($deliveryMethods -and $deliveryMethods.Count -gt 0 -and $paymentMethods -and $paymentMethods.Count -gt 0) {
        $orderData = @{
            customer_name = "Test Customer"
            customer_phone = "+7-900-123-45-67" 
            customer_email = "test@example.com"
            delivery_method_id = $deliveryMethods[0].id
            payment_method_id = $paymentMethods[0].id
            customer_notes = "Test order for status update testing"
            order_items = @(
                @{
                    product_id = "aa1d0163-72a1-444e-a63e-a1890ebaed6a"
                    quantity = 2
                }
            )
        } | ConvertTo-Json -Depth 3        Write-Host "`nCreating order directly through order service..." -ForegroundColor Yellow
        
        try {
            $orderResponse = Invoke-RestMethod -Uri "http://localhost:8001/api/v1/orders/" -Method POST -Body $orderData -Headers $headers
            Write-Host "✓ Order created successfully!" -ForegroundColor Green
            Write-Host "Order ID: $($orderResponse.id)" -ForegroundColor Cyan
            Write-Host "Order Number: $($orderResponse.order_number)" -ForegroundColor Cyan
            Write-Host "Status: $($orderResponse.status_name)" -ForegroundColor Cyan
            
            Write-Host "`n=== ORDER CREATED SUCCESSFULLY ===" -ForegroundColor Green
            Write-Host "You can now test status updates with order ID: $($orderResponse.id)" -ForegroundColor Yellow
            
        } catch {
            Write-Host "✗ Error creating order: $($_.Exception.Message)" -ForegroundColor Red
            if ($_.Exception.Response) {
                $errorStream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorStream)
                $errorContent = $reader.ReadToEnd()
                Write-Host "Error details: $errorContent" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "✗ Cannot create order - missing delivery or payment methods" -ForegroundColor Red
    }
    
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}
