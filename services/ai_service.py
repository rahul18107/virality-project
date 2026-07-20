import httpx
import os
from dotenv import load_dotenv

load_dotenv()

ACCOUNT_ID = os.getenv("CLOUDFLARE_ACCOUNT_ID")
API_TOKEN = os.getenv("CLOUDFLARE_TOKEN")

def generate_personas(count: int, demographic: str):
    prompt = f"""
    Generate {count} AI personas for the demographic: {demographic}.
    
    Return a JSON array where each persona has:
    - name
    - age
    - region
    - interests (list of 3-5 things)
    - behavior (how they use social media)
    - engagement_threshold (float between 0.1 and 0.9)
    
    Return ONLY the JSON array, no extra text, no markdown backticks.
    """

    with httpx.Client() as client:
        response = client.post(
            f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct",
            headers={"Authorization": f"Bearer {API_TOKEN}"},
            json={"messages": [
                {"role": "system", "content": "You are a helpful assistant that returns only valid JSON."},
                {"role": "user", "content": prompt}
            ]},
            timeout=30.0
        )
        response.raise_for_status()

        import json

        data = response.json()["result"]["response"]

        # Some models return the JSON already parsed (list/dict),
        # others return it as a string. Normalize to a JSON string.
        if isinstance(data, (list, dict)):
            return json.dumps(data)

        text = str(data)
        start = text.find("[")
        end = text.rfind("]")
        return text[start:end + 1]