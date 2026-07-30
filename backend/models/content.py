from pydantic import BaseModel

class Content(BaseModel):
    title: str
    description: str
    category: str        # fitness, comedy, fashion, tech etc
    duration_seconds: int
    hook: str            # what happens in first 3 seconds