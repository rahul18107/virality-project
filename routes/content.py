from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ContentInput(BaseModel):
    title: str
    description: str
    category: str
    duration_seconds: int
    hook: str

@router.post("/analyze")
def analyze_content(content: ContentInput):
    return {
        "title": content.title,
        "description": content.description,
        "category": content.category,
        "duration_seconds": content.duration_seconds,
        "hook": content.hook,
        "status": "ready for simulation"
    }