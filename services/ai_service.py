import base64

import httpx
import os
import json
from dotenv import load_dotenv

load_dotenv()

ACCOUNT_ID = os.getenv("CLOUDFLARE_ACCOUNT_ID")
API_TOKEN = os.getenv("CLOUDFLARE_TOKEN")

def generate_personas(count: int, demographic: str):
    prompt = f"""
    Generate {count} AI personas for the demographic: {demographic}.

    Return ONLY a JSON array, starting with [ and ending with ].
    Each persona must have: name, age, region, interests, behavior, engagement_threshold.
    No extra text, no labels, no markdown, just the raw JSON array.
    """

    with httpx.Client() as client:
        # try up to 3 times in case the model returns broken JSON
        last_error = None
        for _ in range(3):
            response = client.post(
                f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct",
                headers={"Authorization": f"Bearer {API_TOKEN}"},
                json={
                    "messages": [
                        {"role": "system", "content": "You are a helpful assistant that returns only valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 4096
                },
                timeout=30.0
            )
            response.raise_for_status()

            result = response.json()
            response_text = result["result"]["response"]

            # model may return already-parsed JSON (list) or a string
            if isinstance(response_text, list):
                return json.dumps(response_text)

            start = response_text.find("[")
            end = response_text.rfind("]") + 1
            clean_json = response_text[start:end]

            # validate before returning — retry if broken
            try:
                json.loads(clean_json)
                return clean_json
            except json.JSONDecodeError as e:
                last_error = e
                continue

        raise ValueError(f"Model returned invalid JSON after 3 attempts: {last_error}")
    


def analyze_video(frames: list):
     with httpx.Client() as client:
        response = client.post(
            f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/@cf/meta/llama-4-scout-17b-16e-instruct",
            headers={"Authorization": f"Bearer {API_TOKEN}"},
             json={
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{frames[0]}"
                                }
                            },
                            {
                                "type": "text",
                                "text": "Analyze this social media reel frame. Describe the main topic, mood, target audience and content category in 2-3 sentences."
                            }
                        ]
                    }
                ]
            },
            timeout=60.0
        )
        result = response.json()
        print("VISION RESULT:", result)
        return  result["result"]["response"]
     
def transcribe_audio(audio_path: str):
    with open(audio_path, "rb") as f:
        audio_bytes = f.read()
    
    with httpx.Client() as client:
        response = client.post(
            f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/@cf/openai/whisper",
            headers={
                "Authorization": f"Bearer {API_TOKEN}",
                "Content-Type": "application/octet-stream"
            },
            content=audio_bytes,
            timeout=120.0
        )
        result = response.json()
        print("WHISPER RESULT:", result)
        return result["result"]["text"]