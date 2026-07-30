from fastapi import APIRouter, UploadFile, File
from services.video_service import extract_frames,extract_audio
from services.ai_service import analyze_video ,transcribe_audio
import shutil
import os

router = APIRouter()

@router.post("/analyze")
async def analyze_content(video: UploadFile = File(...)):
    
    # save uploaded video temporarily
    temp_path = f"temp_{video.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(video.file, buffer)
    # extract frames from video
    frames = extract_frames(temp_path)
    
    # analyze video
    v_description = analyze_video(frames)

    # extract audio and transcribe
    audio_path = extract_audio(temp_path)
    transcript = transcribe_audio(audio_path)

     # combine both
    full_description = f"Visual: {v_description} | Audio transcript: {transcript}"
    
    # delete temp file
    os.remove(temp_path)
    os.remove(audio_path)
    
    return {
        "filename": video.filename,
        "visual_description": v_description,
        "transcript": transcript,
        "full_description": full_description,
        "status": "ready for simulation"
    }