from pydantic import BaseModel


class ProductImportRowError(BaseModel):
    row: int
    message: str


class ProductImportReport(BaseModel):
    total_rows: int
    created: int
    updated: int
    errors: list[ProductImportRowError]
