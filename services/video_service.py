import cv2
import base64
import os

def extract_frames(video_path: str, num_frames: int = 3):
    """
    Opens a video file and extracts frames at equal intervals.
    Returns them as base64 encoded strings (so we can send to AI).
    """
    video = cv2.VideoCapture(video_path)
    
    total_frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
    interval = total_frames // num_frames
    
    frames = []
    
    for i in range(num_frames):
        # jump to the frame position
        video.set(cv2.CAP_PROP_POS_FRAMES, i * interval)
        success, frame = video.read()
        
        if success:
            # convert frame to base64 string
            _, buffer = cv2.imencode('.jpg', frame)
            frame_base64 = base64.b64encode(buffer).decode('utf-8')
            frames.append(frame_base64)
    
    video.release()
    return frames