from fastapi import FastAPI
from routes import personas

app = FastAPI()

app.include_router(personas.router, prefix="/personas")