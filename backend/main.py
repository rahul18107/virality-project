from fastapi import FastAPI

from routes import content, personas, simulate 

app = FastAPI()

app.include_router(personas.router, prefix="/personas")
app.include_router(content.router, prefix="/content")
app.include_router(simulate.router, prefix="/simulate")