from fastapi import APIRouter
from pydantic import BaseModel
from services.reaction_service import get_persona_reaction
from services.ai_service import generate_personas
from services.scoring_service import calculate_virality_score
import json

router = APIRouter()

class SimulationInput(BaseModel):
    title: str
    description: str
    category: str
    duration_seconds: int
    hook: str
    persona_count: int = 5
    demographic: str = "india_18_25"

@router.post("/run")
def run_simulation(input: SimulationInput):
    
    content = {
        "title": input.title,
        "description": input.description,
        "category": input.category,
        "duration_seconds": input.duration_seconds,
        "hook": input.hook
    }
    
    all_waves = []
    current_count = input.persona_count
    wave_number = 1
    max_waves = 3
    threshold = 20  # minimum score to continue to next wave

    while wave_number <= max_waves:
        
        # generate personas for this wave
        personas_raw = generate_personas(current_count, input.demographic)
        personas = json.loads(personas_raw)
        
        # get reactions
        reactions = []
        for persona in personas:
            reaction = get_persona_reaction(persona, content)
            reactions.append({
                "persona": persona["name"],
                "age": persona["age"],
                "region": persona["region"],
                "reaction": reaction
            })
        
        # score this wave
        wave_score = calculate_virality_score(reactions)
        
        all_waves.append({
            "wave": wave_number,
            "personas_shown": current_count,
            "score": wave_score,
            "reactions": reactions
        })
        
        # decide if we continue to next wave
        if wave_score["score"] < threshold:
            break
        
        # next wave gets 3x more personas
        current_count = current_count * 2
        wave_number += 1
    
    # final virality based on last wave
    final_score = all_waves[-1]["score"]
    total_reached = sum(w["personas_shown"] for w in all_waves)
    
    return {
        "content": input.title,
        "total_waves": len(all_waves),
        "total_personas_reached": total_reached,
        "final_virality": final_score,
        "waves": all_waves
    }