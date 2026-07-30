import cv2
import base64
import os
import httpx
from dotenv import load_dotenv
import subprocess

load_dotenv()

HF_TOKEN = os.getenv("HUGGINGFACE_TOKEN")

def extract_frames(video_path: str, num_frames: int = 4):
    video = cv2.VideoCapture(video_path)
    total_frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
    interval = total_frames // num_frames
    
    frames = []
    for i in range(num_frames):
        video.set(cv2.CAP_PROP_POS_FRAMES, i * interval)
        success, frame = video.read()
        if success:
            # resize to max 512px wide to reduce payload size
            h, w = frame.shape[:2]
            if w > 512:
                scale = 512 / w
                frame = cv2.resize(frame, (512, int(h * scale)))
            
            # encode with lower quality to reduce size
            _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 60])
            frame_base64 = base64.b64encode(buffer).decode('utf-8')
            frames.append(frame_base64)
    
    video.release()
    return frames

def extract_audio(video_path: str):
    audio_path = video_path.replace(".mp4", ".mp3")
    
    # extract audio using ffmpeg
    subprocess.run([
        "ffmpeg", "-i", video_path,
        "-q:a", "0", "-map", "a",
        audio_path, "-y"
    ], capture_output=True)
    
    return audio_path


