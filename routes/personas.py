from fastapi import APIRouter
from services.ai_service import generate_personas

router = APIRouter()

@router.post("/generate")
def generate(count: int, demographic: str):
    result = generate_personas(count, demographic)
    return {"raw": result}