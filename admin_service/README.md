# Admin Service

Микросервис панели управления для Light Bulb Store.

## Описание

Admin Service предоставляет API для управления административной панелью магазина лампочек. Основные функции:

- Аутентификация и авторизация администраторов
- Управление учетными записями администраторов
- Журналирование действий (audit logs)
- Прокси-доступ к другим микросервисам (продукты, заказы)

## Структура базы данных

### admin_users
- `id` (UUID) - Уникальный идентификатор
- `username` (VARCHAR(100)) - Логин 
- `email` (VARCHAR(255)) - Email
- `password_hash` (VARCHAR(255)) - Хеш пароля
- `first_name` (VARCHAR(100)) - Имя
- `last_name` (VARCHAR(100)) - Фамилия
- `is_active` (BOOLEAN) - Статус активности
- `last_login_at` (TIMESTAMP) - Время последнего входа
- `created_at` (TIMESTAMP) - Время создания
- `updated_at` (TIMESTAMP) - Время обновления

### audit_logs
- `id` (UUID) - Уникальный идентификатор
- `user_id` (UUID) - ID администратора
- `action` (VARCHAR(255)) - Действие
- `target_resource_type` (VARCHAR(100)) - Тип ресурса
- `target_resource_id` (VARCHAR(255)) - ID ресурса
- `details` (JSONB) - Детали действия
- `ip_address` (VARCHAR(45)) - IP адрес
- `user_agent` (TEXT) - User Agent
- `timestamp` (TIMESTAMP) - Время действия

## API Endpoints

### Аутентификация
- `POST /auth/login` - Вход (form data)
- `POST /auth/login-json` - Вход (JSON)

### Управление пользователями
- `GET /admin/users` - Список администраторов
- `GET /admin/users/me` - Текущий пользователь
- `GET /admin/users/{user_id}` - Информация о пользователе
- `POST /admin/users` - Создать пользователя
- `PUT /admin/users/{user_id}` - Обновить пользователя
- `DELETE /admin/users/{user_id}` - Удалить пользователя

### Журнал аудита
- `GET /admin/audit/logs` - Журнал действий
- `GET /admin/audit/logs/actions` - Доступные действия
- `GET /admin/audit/logs/resource-types` - Типы ресурсов

### Управление продуктами (проксирование)
- `GET /admin/products` - Список продуктов
- `GET /admin/products/{product_id}` - Информация о продукте
- `POST /admin/products` - Создать продукт
- `PUT /admin/products/{product_id}` - Обновить продукт
- `DELETE /admin/products/{product_id}` - Удалить продукт

### Управление заказами (проксирование)
- `GET /admin/orders` - Список заказов
- `GET /admin/orders/{order_id}` - Информация о заказе
- `PUT /admin/orders/{order_id}/status` - Обновить статус заказа
- `GET /admin/orders/stats` - Статистика заказов

## Установка и запуск

### С помощью Docker Compose

```bash
# Запуск всех сервисов
docker-compose up -d

# Создание первого админ-пользователя
docker-compose exec admin-api python scripts/create_admin.py
```

### Локальная разработка

1. Установите зависимости:
```bash
pip install -r requirements.txt
```

2. Настройте переменные окружения:
```bash
cp .env.example .env
# Отредактируйте .env файл
```

3. Запустите миграции:
```bash
alembic upgrade head
```

4. Создайте первого админ-пользователя:
```bash
python scripts/create_admin.py
```

5. Запустите сервер:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Переменные окружения

- `DATABASE_URL` - URL подключения к PostgreSQL
- `SECRET_KEY` - Секретный ключ для JWT токенов
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Время жизни токена в минутах
- `PRODUCT_SERVICE_URL` - URL продуктового сервиса
- `ORDER_SERVICE_URL` - URL сервиса заказов
- `CORS_ORIGINS` - Разрешенные источники для CORS

## Безопасность

- Пароли хешируются с помощью bcrypt
- JWT токены для аутентификации
- Все действия логируются в audit_logs
- Поддержка CORS для веб-интерфейса

## Первый вход

После развертывания создается админ-пользователь:
- Логин: `admin`
- Пароль: `admin123`
- Email: `admin@lightbulbstore.com`

**Обязательно смените пароль после первого входа!**
