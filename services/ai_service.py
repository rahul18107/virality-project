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