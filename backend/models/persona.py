from pydantic import BaseModel
from typing import List

class Persona(BaseModel):
    name: str
    age: int
    region: str
    interests: List[str]
    behavior: str
    engagement_threshold: float