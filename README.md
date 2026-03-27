# ⚔ GM Tables

Локальное веб-приложение для ГМа — быстрый поиск по таблицам D&D/Pathfinder с iPad или любого браузера в локальной сети.

## Стек

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy 2.0 async, aiosqlite, SQLite
- **Frontend**: React 18, Vite

---

## Быстрый старт

Выходим в корневую папку программы и запускаем команду
```
<Полный путь к корневой папке>\.venv\Scripts\uvicorn.exe backend.main:app --host 0.0.0.0 --port 8000
```

Откроется на `http://localhost:800`

### 3. Доступ с iPad

Убедись, что iPad и компьютер в одной Wi-Fi сети, затем открой в браузере:

```
http://<IP-адрес-компьютера>:800
```

Найти IP: `ipconfig` (Windows) или `ifconfig` / `ip a` (macOS/Linux)

---


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