# Test DELETE product endpoint with authentication
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "Testing DELETE product endpoint with authentication..."

# Step 1: Login to get access token
Write-Host "`n1. Logging in to get access token..."
$loginData = "username=admin&password=admin123"
$loginHeaders = @{
    "Content-Type" = "application/x-www-form-urlencoded"
}

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:8002/auth/login" -Method POST -Body $loginData -Headers $loginHeaders
    $loginResult = $loginResponse.Content | ConvertFrom-Json
    $accessToken = $loginResult.access_token
    Write-Host "Login successful! Got access token."
    
    # Step 2: Add token to headers
    $authHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $accessToken"
    }
    
    # Step 3: Get products through admin service
    Write-Host "`n2. Getting products through admin service..."
    try {
        $productsResponse = Invoke-WebRequest -Uri "http://localhost:8002/admin/products" -Method GET -Headers $authHeaders
        $products = $productsResponse.Content | ConvertFrom-Json
        Write-Host "Got $($products.Count) products through admin service."
        
        if ($products.Count -gt 0) {
            $productToDelete = $products[0]
            $productId = $productToDelete.id
            Write-Host "Will try to delete product: $($productToDelete.name) (ID: $productId)"
            
            # Step 4: Delete product through admin service
            Write-Host "`n3. Deleting product through admin service..."
            try {
                $deleteResponse = Invoke-WebRequest -Uri "http://localhost:8002/admin/products/$productId" -Method DELETE -Headers $authHeaders
                Write-Host "Delete successful! Status: $($deleteResponse.StatusCode)"
                Write-Host "Response: $($deleteResponse.Content)"
            } catch {
                Write-Host "Delete failed!"
                Write-Host "Error: $($_.Exception.Message)"
                if ($_.Exception.Response) {
                    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
                    $errorBody = $_.Exception.Response.GetResponseStream()
                    $reader = New-Object System.IO.StreamReader($errorBody)
                    $responseText = $reader.ReadToEnd()
                    Write-Host "Response Body: $responseText"
                }
            }
        } else {
            Write-Host "No products found to delete."
        }
        
    } catch {
        Write-Host "Failed to get products through admin service:"
        Write-Host "Error: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
        }
    }
    
} catch {
    Write-Host "Login failed!"
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
        $errorBody = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorBody)
        $responseText = $reader.ReadToEnd()
        Write-Host "Response Body: $responseText"
    }
}
