from fastapi import APIRouter, UploadFile, File
from services.video_service import extract_frames,extract_audio, save_upload, cleanup
from services.ai_service import analyze_video ,transcribe_audio

router = APIRouter()

@router.post("/analyze")
async def analyze_content(video: UploadFile = File(...)):

    # save uploaded video temporarily
    temp_path = save_upload(video)
    audio_path = None

    try:
        # extract frames from video
        frames = extract_frames(temp_path)

        # analyze video
        v_description = analyze_video(frames)

        # extract audio and transcribe
        audio_path = extract_audio(temp_path)
        transcript = transcribe_audio(audio_path)
    finally:
        # always delete temp files, even if the analysis above raised
        cleanup(temp_path, audio_path)

     # combine both
    full_description = f"Visual: {v_description} | Audio transcript: {transcript}"

    return {
        "filename": video.filename,
        "visual_description": v_description,
        "transcript": transcript,
        "full_description": full_description,
        "status": "ready for simulation"
    }