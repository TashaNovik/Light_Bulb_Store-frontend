# Light_Bulb_Store
# Ссылка на видеодемонстрацию админской части
https://drive.google.com/file/d/1KxAIbPiGQrNbeS8JYDAVcn-DfU3_Lc2G/view?usp=sharing

## 🐳 Запуск всего проекта через Docker Compose

1. Убедитесь, что установлен Docker и Docker Compose.
2. В корне проекта выполните:
   ```powershell
   docker-compose up --build
   ```
   Это поднимет все сервисы: базы данных, backend-сервисы и фронтенд.

3. После запуска:
   - Фронтенд (клиентское приложение) будет доступен на http://localhost:3000
   - Админ панель (admin-app) будет доступна на http://localhost:3001
   - Product API (product-api) — http://localhost:8000
   - Order API (order-api) — http://localhost:8001
   - Admin API (admin-api) — http://localhost:8002
   - База данных PostgreSQL Order DB   — localhost:5434 (внутри контейнеров: db:5432)
   - База данных PostgreSQL Product DB — localhost:5433 (внутри контейнеров: db:5432)
   - База данных PostgreSQL Admin DB   — localhost:5435 (внутри контейнеров: db:5432)

4. Создание первого администратора:
   ```
   docker-compose exec admin-api python scripts/create_admin.py
   ```
   Это создаст администратора с данными:
   - Логин: `admin`
   - Пароль: `admin123`
   - Email: `admin@lightbulbstore.com`
   
   **Обязательно смените пароль после первого входа в админ панель!**

5. Для остановки всех контейнеров:
   ```powershell
   docker-compose down
   ```

## 🏗️ Архитектура проекта

Проект состоит из следующих компонентов:

### Frontend приложения:
- **client-app** (порт 3000) — основное клиентское приложение для покупателей
- **admin-app** (порт 3001) — панель администратора для управления магазином

### Backend сервисы:
- **product-api** (порт 8000) — API для управления товарами
- **order-api** (порт 8001) — API для управления заказами
- **admin-api** (порт 8002) — API для административной панели

### Базы данных:
- **product_db** (порт 5433) — PostgreSQL для данных о товарах
- **order_db** (порт 5434) — PostgreSQL для данных о заказах
- **admin_db** (порт 5435) — PostgreSQL для данных администраторов

## 🔐 Первый вход в админ панель

После запуска системы через Docker Compose:

1. Откройте админ панель: http://localhost:3001
2. Используйте данные для входа:
   - **Логин:** `admin`
   - **Пароль:** `admin123`
3. **Обязательно смените пароль** после первого входа для безопасности

## 🛠️ Локальная разработка

### Запуск только фронтенд приложений

#### Клиентское приложение (client-app):
```powershell
cd client-app
npm install
npm run dev
```
Приложение будет доступно на http://localhost:5173

#### Админ панель (admin-app):
```powershell
cd admin-app
npm install  
npm run dev
```
Админ панель будет доступна на http://localhost:5174

### Запуск backend сервисов локально

#### Product Service:
```powershell
cd product_service
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

#### Order Service:
```powershell
cd order_service
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8001
```

#### Admin Service:
```powershell
cd admin_service
pip install -r requirements.txt
alembic upgrade head
python scripts/create_admin.py  # Создание первого администратора
uvicorn app.main:app --reload --port 8002
```