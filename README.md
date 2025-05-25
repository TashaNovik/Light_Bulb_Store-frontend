# Light_Bulb_Store
Ссылка на видеодемонстрацию:
https://drive.google.com/file/d/1PcJ3qVgEzGMELsFUMVrS-XiN90eJnmAa/view


## 🐳 Запуск всего проекта через Docker Compose

1. Убедитесь, что установлен Docker и Docker Compose.
2. В корне проекта выполните:
   ```powershell
   docker-compose up --build
   ```
   Это поднимет все сервисы: базы данных, backend-сервисы и фронтенд.

3. После запуска:
   - Фронтенд будет доступен на http://localhost:3000
   - Product API (product-api) — http://localhost:8000
   - Order API (order-api) — http://localhost:8001
   - База данных PostgreSQL Order DB   — localhost:5434 (внутри контейнеров: db:5432)
   - База данных PostgreSQL Product DB — localhost:5433 (внутри контейнеров: db:5432)

4. Для остановки всех контейнеров:
   ```powershell
   docker-compose down
   ```