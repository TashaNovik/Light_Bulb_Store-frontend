# PowerShell script для тестирования создания продукта
# Сначала нужно получить токен аутентификации

# 1. Создание админа (если не создан)
Write-Host "Создание админ пользователя..." -ForegroundColor Green
$createAdminResponse = Invoke-RestMethod -Uri "http://localhost:8002/auth/create-admin" -Method Post -ContentType "application/json" -Body (@{
    username = "admin"
    email = "admin@lightbulbstore.com"
    password = "admin123"
    first_name = "Admin"
    last_name = "User"
} | ConvertTo-Json) -ErrorAction SilentlyContinue

# 2. Вход в систему для получения токена
Write-Host "Вход в систему..." -ForegroundColor Green
$loginData = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8002/auth/login" -Method Post -ContentType "application/json" -Body $loginData
    $token = $loginResponse.access_token
    Write-Host "Токен получен: $($token.Substring(0, 20))..." -ForegroundColor Yellow

    # 3. Создание продукта
    Write-Host "Создание продукта..." -ForegroundColor Green
    $productData = @{
        name = "LED лампочка E27 10W теплый свет"
        sku = "LED-E27-10W-WW-$(Get-Random -Minimum 100 -Maximum 999)"
        description = "Энергосберегающая LED лампочка с цоколем E27, мощность 10W, теплый белый свет 3000K"
        manufacturer_name = "ООО `"Лампочка`""
        current_price = 299.99
        stock_quantity = 150
        image_url = "https://example.com/images/led-e27-10w.jpg"
        attributes = @{
            wattage = "10W"
            color_temperature = "3000K"
            light_color = "Теплый белый"
            socket_type = "E27"
            energy_class = "A++"
            dimmable = $false
            lifespan_hours = 25000
            lumen = 800
        }
    } | ConvertTo-Json -Depth 3

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $productResponse = Invoke-RestMethod -Uri "http://localhost:8002/admin/products" -Method Post -Headers $headers -Body $productData
    Write-Host "Продукт создан успешно!" -ForegroundColor Green
    Write-Host "ID продукта: $($productResponse.id)" -ForegroundColor Yellow
    Write-Host "SKU: $($productResponse.sku)" -ForegroundColor Yellow
    
} catch {
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $responseStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($responseStream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Детали ошибки: $responseBody" -ForegroundColor Red
    }
}
