import cv2
import base64
import os
import httpx
from dotenv import load_dotenv
import subprocess
import shutil
import tempfile
import uuid

load_dotenv()

HF_TOKEN = os.getenv("HUGGINGFACE_TOKEN")


def save_upload(upload_file):
    """Save an UploadFile to a uniquely-named temp file and return its path.

    The client-supplied filename is never used as a path — only its extension is
    kept, so uploads can't collide with each other or escape the temp directory.
    """
    suffix = os.path.splitext(upload_file.filename or "")[1] or ".mp4"
    path = os.path.join(tempfile.gettempdir(), f"upload_{uuid.uuid4().hex}{suffix}")
    with open(path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    return path


def cleanup(*paths):
    """Best-effort delete — never masks the real error with a cleanup failure."""
    for path in paths:
        if not path or not os.path.exists(path):
            continue
        try:
            os.remove(path)
        except OSError as e:
            print("CLEANUP WARNING:", path, e)

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
    """Extract the audio track as mp3. Returns None if the file has no audio."""
    base, _ = os.path.splitext(video_path)
    audio_path = f"{base}.mp3"

    # a non-.mp4 upload (e.g. an .mp3) would otherwise make ffmpeg overwrite its
    # own input and leave the caller deleting the same file twice
    if os.path.abspath(audio_path) == os.path.abspath(video_path):
        audio_path = f"{base}_audio.mp3"

    result = subprocess.run([
        "ffmpeg", "-i", video_path,
        "-q:a", "0", "-map", "a",
        audio_path, "-y"
    ], capture_output=True)

    # ffmpeg exits non-zero when there's no audio stream to map, and can also
    # leave a 0-byte file behind — both mean "nothing to transcribe"
    if result.returncode != 0 or not os.path.exists(audio_path) or os.path.getsize(audio_path) == 0:
        print("FFMPEG ERROR:", result.stderr.decode("utf-8", "replace")[-500:])
        cleanup(audio_path)
        return None

    return audio_path


