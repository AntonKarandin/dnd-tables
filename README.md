# ⚔ GM Tables

Локальное веб-приложение для ГМа — быстрый поиск по таблицам D&D/Pathfinder с iPad или любого браузера в локальной сети.

## Стек

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy 2.0 async, aiosqlite, SQLite
- **Frontend**: React 18, Vite

---

## Быстрый старт

### 1. Backend

```bash
cd gm-tables

# Создать виртуальное окружение
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Установить зависимости
pip install -r backend/requirements.txt

# Запустить сервер (с авто-созданием БД и seed-данными)
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

API будет доступно на `http://localhost:8000`  
Swagger UI: `http://localhost:8000/docs`

### 2. Frontend (режим разработки)

```bash
cd frontend
npm install
npm run dev
```

Откроется на `http://localhost:5173`

### 3. Доступ с iPad

Убедись, что iPad и компьютер в одной Wi-Fi сети, затем открой в браузере:

```
http://<IP-адрес-компьютера>:5173
```

Найти IP: `ipconfig` (Windows) или `ifconfig` / `ip a` (macOS/Linux)

---

## Продакшн сборка (опционально)

```bash
cd frontend && npm run build
# Статика попадёт в frontend/dist/
# FastAPI сам отдаст её — только uvicorn нужен
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

---

## API

| Метод  | Путь                          | Описание                      |
|--------|-------------------------------|-------------------------------|
| GET    | /api/tables                   | Список всех таблиц            |
| POST   | /api/tables                   | Создать таблицу               |
| GET    | /api/tables/{id}              | Одна таблица                  |
| PUT    | /api/tables/{id}              | Обновить таблицу              |
| DELETE | /api/tables/{id}              | Удалить таблицу               |
| GET    | /api/tables/{id}/lookup?roll= | Найти результат по броску     |

---

## Структура проекта

```
gm-tables/
├── backend/
│   ├── __init__.py
│   ├── main.py          # FastAPI app, lifespan, CORS, static
│   ├── database.py      # async engine, session, init_db
│   ├── models.py        # SQLAlchemy ORM models
│   ├── schemas.py       # Pydantic schemas
│   ├── seed.py          # Дефолтные таблицы
│   ├── requirements.txt
│   └── routers/
│       └── tables.py    # CRUD + lookup endpoints
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api/
│       │   └── tables.js   # fetch-обёртки
│       └── components/
│           └── TableEditor.jsx
└── README.md
```