# Quick Test Examples - Update Order Status

## Endpoint
`PUT /admin/orders/{order_id}/status`

## Request Body Schema
```json
{
  "status_id": "UUID4 (required)",
  "actor_details": "string (optional)", 
  "notes": "string (optional)"
}
```

## Available Status IDs
```
NEW:             f7661699-0081-4b93-b227-f51c2a188936
PENDING_PAYMENT: d5ee11b3-2dc2-4eeb-81fd-ebeeb7fa35cd
PROCESSING:      e87d2783-d80f-4a42-a7e4-a7302f6b7510
SHIPPED:         823f3c37-200e-4a7c-9466-84ea031e3af3
DELIVERED:       823d75db-b9c6-4f58-a2f0-1bbc294cc910
CANCELLED:       0a455718-3182-4366-a857-94ada249ed11
```

## Quick Test Examples

### Mark as Shipped
```json
{
  "status_id": "823f3c37-200e-4a7c-9466-84ea031e3af3",
  "actor_details": "Admin Test",
  "notes": "Test shipment"
}
```

### Mark as Delivered  
```json
{
  "status_id": "823d75db-b9c6-4f58-a2f0-1bbc294cc910",
  "actor_details": "Delivery System",
  "notes": "Package delivered successfully"
}
```

### Cancel Order
```json
{
  "status_id": "0a455718-3182-4366-a857-94ada249ed11",
  "actor_details": "Customer Service",
  "notes": "Cancelled by customer request"
}
```

### Minimal Request
```json
{
  "status_id": "e87d2783-d80f-4a42-a7e4-a7302f6b7510"
}
```

## PowerShell Test Command
```powershell
# Get auth token first
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8002/auth/login" -Method POST -Body "username=admin&password=admin123" -ContentType "application/x-www-form-urlencoded"
$token = $loginResponse.access_token

# Update order status
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

$body = @{
    status_id = "823f3c37-200e-4a7c-9466-84ea031e3af3"
    actor_details = "Test User"
    notes = "Quick test update"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8002/admin/orders/YOUR_ORDER_ID/status" -Method PUT -Headers $headers -Body $body
```
