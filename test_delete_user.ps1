# Test DELETE user endpoint with authentication
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "Testing DELETE user endpoint with authentication..."

# Step 1: Login to get access token
Write-Host "`n1. Logging in to get access token..."
$loginData = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

$loginHeaders = @{
    "Content-Type" = "application/json"
}

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:8002/auth/login-json" -Method POST -Body $loginData -Headers $loginHeaders
    $loginResult = $loginResponse.Content | ConvertFrom-Json
    $accessToken = $loginResult.access_token
    Write-Host "Login successful! Got access token."
    Write-Host "Current user: $($loginResult.user.username) (ID: $($loginResult.user.id))"
    
    # Step 2: Add token to headers
    $authHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $accessToken"
    }
    
    # Step 3: Get all users
    Write-Host "`n2. Getting all users..."
    try {
        $usersResponse = Invoke-WebRequest -Uri "http://localhost:8002/admin/users" -Method GET -Headers $authHeaders
        $users = $usersResponse.Content | ConvertFrom-Json
        Write-Host "Got $($users.Count) users."
        
        # Find a user to delete (not the current user)
        $currentUserId = $loginResult.user.id
        $userToDelete = $users | Where-Object { $_.id -ne $currentUserId } | Select-Object -First 1
        
        if ($userToDelete) {
            $userId = $userToDelete.id
            Write-Host "Will try to delete user: $($userToDelete.username) (ID: $userId)"
            
            # Step 4: Delete user
            Write-Host "`n3. Deleting user..."
            try {
                $deleteResponse = Invoke-WebRequest -Uri "http://localhost:8002/admin/users/$userId" -Method DELETE -Headers $authHeaders
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
            Write-Host "No other users found to delete (cannot delete current user)."
            
            # Create a test user first
            Write-Host "`n3. Creating a test user to delete..."
            $testUserData = @{
                username = "testuser_$(Get-Random)"
                email = "testuser$(Get-Random)@example.com"
                password = "password123"
                is_active = $true
            } | ConvertTo-Json
            
            try {
                $createResponse = Invoke-WebRequest -Uri "http://localhost:8002/admin/users" -Method POST -Body $testUserData -Headers $authHeaders
                $createdUser = $createResponse.Content | ConvertFrom-Json
                Write-Host "Test user created: $($createdUser.username) (ID: $($createdUser.id))"
                
                # Now delete the test user
                Write-Host "`n4. Deleting test user..."
                $deleteResponse = Invoke-WebRequest -Uri "http://localhost:8002/admin/users/$($createdUser.id)" -Method DELETE -Headers $authHeaders
                Write-Host "Delete successful! Status: $($deleteResponse.StatusCode)"
                Write-Host "Response: $($deleteResponse.Content)"
                
            } catch {
                Write-Host "Failed to create or delete test user:"
                Write-Host "Error: $($_.Exception.Message)"
                if ($_.Exception.Response) {
                    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
                    $errorBody = $_.Exception.Response.GetResponseStream()
                    $reader = New-Object System.IO.StreamReader($errorBody)
                    $responseText = $reader.ReadToEnd()
                    Write-Host "Response Body: $responseText"
                }
            }
        }
        
    } catch {
        Write-Host "Failed to get users:"
        Write-Host "Error: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
            $errorBody = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorBody)
            $responseText = $reader.ReadToEnd()
            Write-Host "Response Body: $responseText"
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
