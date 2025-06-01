# Test DELETE product endpoint
$headers = @{
    "Content-Type" = "application/json"
}

# First, let's get all products to see what IDs we have
Write-Host "Getting all products..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/products/" -Method GET -Headers $headers
    $products = $response.Content | ConvertFrom-Json
    
    Write-Host "Found $($products.Count) products:"
    foreach ($product in $products) {
        Write-Host "- ID: $($product.id), Name: $($product.name), SKU: $($product.sku)"
    }
    
    # Try to delete the first product if any exist
    if ($products.Count -gt 0) {
        $productToDelete = $products[0]
        $productId = $productToDelete.id
        
        Write-Host "`nTrying to delete product with ID: $productId"
        
        # Test direct call to product service
        Write-Host "1. Testing direct call to product service..."
        try {
            $deleteResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/products/$productId" -Method DELETE -Headers $headers
            Write-Host "Direct delete successful! Status: $($deleteResponse.StatusCode)"
        } catch {
            Write-Host "Direct delete failed: $($_.Exception.Message)"
            if ($_.Exception.Response) {
                Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
                Write-Host "Response: $($_.Exception.Response)"
            }
        }
        
        # Test call through admin service (this would require authentication)
        Write-Host "`n2. Testing call through admin service (would need auth token)..."
        Write-Host "URL would be: http://localhost:8002/admin/products/$productId"
    } else {
        Write-Host "No products found to delete."
    }
    
} catch {
    Write-Host "Error getting products: $($_.Exception.Message)"
}
