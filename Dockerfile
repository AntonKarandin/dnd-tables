FROM python:3.11-slim

WORKDIR /app

# Установка зависимостей
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем бэкенд
COPY backend/ ./backend/

# Копируем собранный фронт (frontend/dist/)
COPY frontend/dist/ ./frontend/dist/

# Папка для БД — будет подключена как volume
RUN mkdir -p /app/data

CMD ["uvicorn", "backend.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]
