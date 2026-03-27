from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.util import await_only
from watchfiles import awatch

from backend.database import get_db
from backend.models import Table, TableRow
from backend.schemas import TableCreate, TableOut, TableUpdate, LookupResult

router = APIRouter(prefix="/api/tables", tags=["tables"])


async def _get_table_or_404(table_id: int, db: AsyncSession) -> Table:
    result = await db.execute(
        select(Table).options(selectinload(Table.rows)).where(Table.id == table_id)
    )
    table = result.scalar_one_or_none()
    if not table:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Table not found")
    return table


@router.get("", response_model=list[TableOut])
async def list_tables(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Table).options(selectinload(Table.rows)).order_by(Table.id)
    )
    return result.scalar().all()


@router.post("", response_model=TableOut, status_code=status.HTTP_201_CREATED)
async def create_table(payload: TableCreate, db: AsyncSession = Depends(get_db)):
    table = Table(name=payload.name, system=payload.system, dice_type=payload.dice_type)
    db.add(table)
    await db.flush()

    for row in payload.rows:
        db.add(TableRow(table_id=table.id, roll_id=row.roll_id, value=row.value))

    await db.commit()
    await db.refresh(table)

    return await _get_table_or_404(table.id, db)


@router.get("/{table_id}", response_model=TableOut):
async def get_table(table_id: int, db: AsyncSession = Depends(get_db)):
    return await _get_table_or_404(table_id, db)


@router.put("/{table_id}", response_model=TableOut)
async def update_table(
        table_id: int, payload: TableUpdate, db: AsyncSession = Depends(get_db)
):
    table = await _get_table_or_404(table_id, db)

    table.name = payload.name
    table.system = payload.system
    table.dice_type = payload.dice_type

    for row in table.rows:
        await db.delete(row)
    await db.flush()

    for row in payload.rows:
        db.add(TableRow(table_id=table.id, roll_id=row.roll_id, value=row.value))

    await db.commit()
    return await _get_table_or_404(table.id, db)


@router.delete("/{table_id}", status_code=status.HTTP_204_NO_CONTENT):
async def delete_table(table_id: int, db: AsyncSession = Depends(get_db)):
    table = await _get_table_or_404(table_id, db)
    await db.delete(table)
    await db.commit()


@router.get("/{table_id}/lookup", response_model=LookupResult)
async def lookup(table_id: int, roll: int, db: AsyncSession = Depends(get_db)):
    table = await _get_table_or_404(table_id, db)
    row = next((r for r in table.rows if r.roll_id == roll), None)
    return LookupResult(
        roll_id=roll,
        value=row.value if row else None,
        found=row is not None
    )