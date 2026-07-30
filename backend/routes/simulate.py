import random
from fastapi import APIRouter,UploadFile, File, Form
from pydantic import BaseModel
from services.reaction_service import get_batch_reactions
from services.ai_service import generate_personas,analyze_video,transcribe_audio
from services.video_service import extract_frames, extract_audio
from services.scoring_service import calculate_virality_score
import json
import shutil
import os

router = APIRouter()



@router.post("/run")
async def run_simulation(video: UploadFile = File(...),
    persona_count: int = Form(3),
    demographic: str = Form("india_18_25")):


    # step 1: save video temporarily
    temp_path = f"temp_{video.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(video.file, buffer)
    
    # step 2: analyze video
    frames = extract_frames(temp_path)
    visual_description = analyze_video(frames)
    
    audio_path = extract_audio(temp_path)
    transcript = transcribe_audio(audio_path)
    
    full_description = f"Visual: {visual_description} | Audio: {transcript}"
    
    # cleanup temp files
    os.remove(temp_path)
    os.remove(audio_path)
    
    content = {
        "title": video.filename,
        "description": full_description,
        "category": "auto-detected",
        "duration_seconds": 0,
        "hook": visual_description[:100] if visual_description else "No visual description"
    }
    
    all_waves = []
    current_count = persona_count
    wave_number = 1
    max_waves = 3
    threshold = 20  # minimum score to continue to next wave

    while wave_number <= max_waves:
        
        # generate personas for this wave
        personas_raw = generate_personas(current_count, demographic)
        personas = json.loads(personas_raw)
        
        # get reactions

        batch_reactions = get_batch_reactions(personas, content)
        reactions = []
        for i, persona in enumerate(personas):
            if i >= len(batch_reactions):
                break
            reactions.append({
                "persona": persona["name"],
                "age": persona["age"],
                "region": persona["region"],
                "x": random.randint(100, 900),  # random position for graph
                "y": random.randint(100, 600),
                "reaction": batch_reactions[i]
            })
        
        # score this wave
        wave_score = calculate_virality_score(reactions)
        
        all_waves.append({
            "wave": wave_number,
            "personas_shown": current_count,
            "personas_reacted": len(reactions),
            "score": wave_score,
            "reactions": reactions
        })
        
        # decide if we continue to next wave
        if wave_score["score"] < threshold:
            break
        
        # next wave gets 3x more personas
        current_count = current_count * 2
        wave_number += 1
    
    # overall virality = reach-weighted average across every wave, not just the
    # last one. pooling the raw reactions gives that for free: each rate becomes
    # a reaction-weighted mean, and the score is linear in those rates. weighting
    # by reactions received (not personas requested) keeps waves where the model
    # returned fewer reactions than asked from being over-counted.
    all_reactions = [r for w in all_waves for r in w["reactions"]]
    final_score = calculate_virality_score(all_reactions)

    peak_wave = max(all_waves, key=lambda w: w["score"]["score"])
    total_reached = sum(w["personas_shown"] for w in all_waves)

    return {
        "content": video.filename,
        "total_waves": len(all_waves),
        "total_personas_reached": total_reached,
        "total_reactions_collected": len(all_reactions),
        "final_virality": final_score,
        "peak_virality": {"wave": peak_wave["wave"], **peak_wave["score"]},
        "waves": all_waves
    }