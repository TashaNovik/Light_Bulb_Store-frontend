# Create a test order for testing order status updates
Write-Host "=== CREATING TEST ORDER ===" -ForegroundColor Green

# Define headers (order service doesn't require authentication)
$headers = @{
    "Content-Type" = "application/json"
}

try {
    Write-Host "Getting delivery methods..." -ForegroundColor Yellow
    try {
        $deliveryMethods = Invoke-RestMethod -Uri "http://localhost:8001/api/v1/orders/delivery-methods" -Method GET
        Write-Host "✓ Found $($deliveryMethods.Count) delivery methods" -ForegroundColor Green
        $deliveryMethods | ForEach-Object { Write-Host "   - $($_.code): $($_.name) (ID: $($_.id))" -ForegroundColor Cyan }
    } catch {
        Write-Host "✗ Error getting delivery methods: $($_.Exception.Message)" -ForegroundColor Red
        return
    }
    
    Write-Host "`nGetting payment methods..." -ForegroundColor Yellow
    try {
        $paymentMethods = Invoke-RestMethod -Uri "http://localhost:8001/api/v1/orders/payment-methods" -Method GET
        Write-Host "✓ Found $($paymentMethods.Count) payment methods" -ForegroundColor Green
        $paymentMethods | ForEach-Object { Write-Host "   - $($_.code): $($_.name) (ID: $($_.id))" -ForegroundColor Cyan }
    } catch {
        Write-Host "✗ Error getting payment methods: $($_.Exception.Message)" -ForegroundColor Red
        return
    }    # Get products to use as order items
    Write-Host "`nGetting products..." -ForegroundColor Yellow
    try {
        $products = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/products/" -Method GET
        if ($products.Count -gt 0) {
            Write-Host "✓ Found $($products.Count) products" -ForegroundColor Green
            Write-Host "   Using product: $($products[0].name) (ID: $($products[0].id), Price: $($products[0].current_price))" -ForegroundColor Cyan
        } else {
            Write-Host "✗ No products found" -ForegroundColor Red
            return
        }
    } catch {
        Write-Host "✗ Error getting products: $($_.Exception.Message)" -ForegroundColor Red
        return
    }

    # Create order data structure matching OrderCreate schema
    $orderData = @{
        customer_name = "Test Customer"
        customer_phone = "+7-900-123-45-67" 
        customer_email = "test@example.com"
        delivery_method_id = $deliveryMethods[0].id
        customer_notes = "Test order for status update testing"
        payment_method_id = $paymentMethods[0].id
        order_items = @(
            @{
                product_id = $products[0].id
                product_snapshot_name = $products[0].name
                product_snapshot_price = [decimal]$products[0].current_price
                quantity = 2
            }
        )
    } | ConvertTo-Json -Depth 3
    
    Write-Host "`nCreating order through order service..." -ForegroundColor Yellow
    Write-Host "Order data: $orderData" -ForegroundColor Gray
    
    try {
        $orderResponse = Invoke-RestMethod -Uri "http://localhost:8001/api/v1/orders/" -Method POST -Body $orderData -Headers $headers
        Write-Host "✓ Order created successfully!" -ForegroundColor Green
        Write-Host "Order ID: $($orderResponse.id)" -ForegroundColor Cyan
        Write-Host "Order Number: $($orderResponse.order_number)" -ForegroundColor Cyan
        Write-Host "Total Amount: $($orderResponse.total_amount)" -ForegroundColor Cyan
        
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
    
} catch {
    Write-Host "✗ Script failed: $($_.Exception.Message)" -ForegroundColor Red
}
