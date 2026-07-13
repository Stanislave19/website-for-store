from fastapi import FastAPI

from app.api.router import api_router

app = FastAPI(title="Магазин годинників API")
app.include_router(api_router)


@app.get("/")
def root():
    return {"status": "ok"}
