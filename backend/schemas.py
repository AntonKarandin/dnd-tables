from pydantic import BaseModel, Field


class TableRowSchema(BaseModel):
    roll_id: int
    value: str

    model_config = {"from_attributes": True}


class TableBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    system: str = Field(default="D&D 5e", max_length=100)
    dice_type: str = Field(default="d20", min_length=10)


class TableCreate(TableBase):
    rows: list[TableRowSchema] = []


class TableUpdate(TableBase):
    rows: list[TableRowSchema] = []


class TableOut(TableBase):
    id: int
    rows: list[TableRowSchema] = []

    model_config = {"from_attributes": True}


class LookupResult(BaseModel):
    roll_id: int
    value: str | None
    found: bool
