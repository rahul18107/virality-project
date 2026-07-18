from fastapi import APIRouter
from models.persona import Persona

router = APIRouter()

@router.post("/generate")
def generate_personas(count: int, demographic: str):
    return {
        "message": f"will generate {count} personas for {demographic}",
        "status": "ok"
    }