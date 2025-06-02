# Update Order Status - Request Body Documentation

## Эндпоинт
- **Admin Service**: `PUT /admin/orders/{order_id}/status`
- **Order Service (direct)**: `PATCH /api/v1/orders/{order_id}/status`

## Схема Request Body (OrderStatusUpdate)

```json
{
  "status_id": "UUID4 (required)",
  "actor_details": "string (optional)",
  "notes": "string (optional)"
}
```

## Описание полей

| Поле | Тип | Обязательное | Описание |
|------|-----|-------------|----------|
| `status_id` | UUID4 | ✅ Да | UUID нового статуса заказа |
| `actor_details` | string | ❌ Нет | Информация о том, кто изменил статус |
| `notes` | string | ❌ Нет | Дополнительные комментарии к изменению статуса |

## Доступные статусы заказов

| ID | Code | Name | Description |
|----|------|------|-------------|
| `f7661699-0081-4b93-b227-f51c2a188936` | NEW | Новый | Заказ создан |
| `d5ee11b3-2dc2-4eeb-81fd-ebeeb7fa35cd` | PENDING_PAYMENT | Ожидает оплаты | Заказ ожидает подтверждения оплаты |
| `e87d2783-d80f-4a42-a7e4-a7302f6b7510` | PROCESSING | В обработке | Заказ принят к обработке |
| `823f3c37-200e-4a7c-9466-84ea031e3af3` | SHIPPED | Отправлен | Заказ отправлен |
| `823d75db-b9c6-4f58-a2f0-1bbc294cc910` | DELIVERED | Доставлен | Заказ доставлен |
| `0a455718-3182-4366-a857-94ada249ed11` | CANCELLED | Отменен | Заказ отменен |

## Примеры Request Body

### 1. Обновление до статуса "Отправлен" (с полной информацией)
```json
{
  "status_id": "823f3c37-200e-4a7c-9466-84ea031e3af3",
  "actor_details": "Admin: admin@lightbulbstore.com",
  "notes": "Заказ передан в службу доставки. Трек-номер: RU123456789"
}
```

### 2. Обновление до статуса "Доставлен"
```json
{
  "status_id": "823d75db-b9c6-4f58-a2f0-1bbc294cc910",
  "actor_details": "System: Delivery confirmation",
  "notes": "Заказ успешно доставлен и получен клиентом"
}
```

### 3. Отмена заказа
```json
{
  "status_id": "0a455718-3182-4366-a857-94ada249ed11",
  "actor_details": "Admin: customer_service",
  "notes": "Отменено по запросу клиента. Возврат средств в течение 3-5 рабочих дней"
}
```

### 4. Минимальный запрос (только обязательные поля)
```json
{
  "status_id": "e87d2783-d80f-4a42-a7e4-a7302f6b7510"
}
```

### 5. Обновление до статуса "В обработке" с детальной информацией
```json
{
  "status_id": "e87d2783-d80f-4a42-a7e4-a7302f6b7510",
  "actor_details": "Warehouse: order_processing_system",
  "notes": "Заказ принят в обработку. Ожидаемое время выполнения: 2-3 рабочих дня"
}
```

## Требования аутентификации

- **Обязательна аутентификация** с правами администратора
- Необходим Bearer token в заголовке `Authorization`

### Пример заголовков
```http
Content-Type: application/json
Authorization: Bearer <access_token>
```

## Ответ сервера

При успешном обновлении возвращается полная информация о заказе:

```json
{
  "id": "order-uuid",
  "order_number": "ORD-20250602-001",
  "customer_name": "Иван Иванов",
  "status_id": "823f3c37-200e-4a7c-9466-84ea031e3af3",
  "total_amount": 1500.00,
  "currency": "RUB",
  "created_at": "2025-06-02T10:00:00Z",
  "updated_at": "2025-06-02T14:30:00Z"
  // ... другие поля заказа
}
```

## Поведение системы

1. **Обновление статуса**: Поле `status_id` заказа обновляется на новое значение
2. **История изменений**: Создается запись в таблице `order_status_history` с информацией:
   - `order_id` - ID заказа
   - `status_id` - новый статус
   - `changed_at` - время изменения (автоматически)
   - `actor_details` - информация об инициаторе (если указано)
   - `notes` - комментарии (если указаны)
3. **Обновление времени**: Поле `updated_at` заказа обновляется автоматически

## Коды ошибок

| Код | Описание |
|-----|----------|
| 401 | Не авторизован |
| 403 | Недостаточно прав |
| 404 | Заказ не найден |
| 422 | Некорректные данные в request body |

## Дополнительные возможности

### Получение истории изменений статуса
```http
GET /api/v1/orders/{order_id}/history
```

### Получение списка доступных статусов
```http
GET /api/v1/orders/statuses
```

## Примеры использования

### PowerShell
```powershell
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $accessToken"
}

$body = @{
    status_id = "823f3c37-200e-4a7c-9466-84ea031e3af3"
    actor_details = "Admin: PowerShell Script"
    notes = "Автоматическое обновление статуса"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8002/admin/orders/$orderId/status" -Method PUT -Body $body -Headers $headers
```

### cURL
```bash
curl -X PUT "http://localhost:8002/admin/orders/{order_id}/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "status_id": "823f3c37-200e-4a7c-9466-84ea031e3af3",
    "actor_details": "Admin: curl_user",
    "notes": "Статус обновлен через API"
  }'
```

### JavaScript/Fetch
```javascript
const response = await fetch(`http://localhost:8002/admin/orders/${orderId}/status`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    status_id: '823f3c37-200e-4a7c-9466-84ea031e3af3',
    actor_details: 'Admin: web_interface',
    notes: 'Обновлено через веб-интерфейс'
  })
});

const updatedOrder = await response.json();
```

## Валидация

- `status_id` должен быть валидным UUID4 и существовать в таблице `order_statuses`
- `actor_details` может содержать до 255 символов (ограничение базы данных)
- `notes` может быть любой длины (тип TEXT в базе данных)
- Заказ с указанным `order_id` должен существовать в системе

---

**Примечание**: Данная документация актуальна для системы Light Bulb Store версии 1.0
