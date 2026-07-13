from fastapi import FastAPI

app = FastAPI(title="Магазин годинників API")


@app.get("/")
def root():
    return {"status": "ok"}
