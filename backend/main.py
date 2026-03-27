from contextlib import asynccontextmanager

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.database import init_db, AsyncSessionLocal
from backend.routers.tables import router as tables_router


async def _seed_if_empty():
    from sqlalchemy import select, func
    from backend.models import Table, TableRow
    from backend.seem import DEFAULT_TABLES

    async with AsyncSessionLocal() as db:
        count = await db.scalar(select(func.count()).select_from(Table))
        if count == 0:
            for t in DEFAULT_TABLES:
                table = Table(
                    name=t["name"],
                    system=t["system"],
                    dice_type=t["dice_type"]
                )
            db.add(table)
            await db.flush()
            for row in t["rows"]:
                db.add(TableRow(
                    table_id=table.id,
                    roll_id=row["roll_id"],
                    value=row["value"]
                ))
            await db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await _seed_if_empty()
    yield


app = FastAPI(title="GM Tables", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tables_router)

# Serve built frontend in production
STATIC_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")


    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        index = os.path.join(STATIC_DIR, "index.html")
        return FileResponse(index)
