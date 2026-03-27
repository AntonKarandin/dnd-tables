from sqlalchemy import String, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.database import Base

class Table(Base):
    __tablename__ = "table"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    system: Mapped[str] = mapped_column(String(100), nullable=False, default='D&D 5e')
    dice_type: Mapped[str] = mapped_column(String(20), nullable=False, default='d20')

    rows: Mapped[list["TableRow"]] = relationship(
        "TableRow",
        back_populates="table",
        cascade="all, delete-orphan",
        order_by="TableRow.roll_id"
    )

class TableRow(Base):
    __tablename__ = "table_row"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    table_id: Mapped[int] = mapped_column(ForeignKey("table.id", ondelete="CASCADE"))
    roll_id: Mapped[int] = mapped_column(Integer, nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False, default="")

    table: Mapped[Table] = relationship("Table", back_populates="rows")