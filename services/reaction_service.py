import httpx
import os
import json
from dotenv import load_dotenv

load_dotenv()

ACCOUNT_ID = os.getenv("CLOUDFLARE_ACCOUNT_ID")
API_TOKEN = os.getenv("CLOUDFLARE_TOKEN")

def get_persona_reaction(persona: dict, content: dict):
    prompt = f"""
    You are simulating a social media user with the following profile:
    - Name: {persona['name']}
    - Age: {persona['age']}
    - Region: {persona['region']}
    - Interests: {', '.join(persona['interests'])}
    - Social media behavior: {persona['behavior']}
    - Engagement threshold: {persona['engagement_threshold']}

    They just saw this Instagram reel:
    - Title: {content['title']}
    - Description: {content['description']}
    - Category: {content['category']}
    - Duration: {content['duration_seconds']} seconds
    - Hook (first 3 seconds): {content['hook']}

    Based on this persona's interests and behavior, decide how they react.
    
    Return ONLY a JSON object like this, no extra text:
    {{
        "watched_fully": true or false,
        "watch_percentage": a number between 0 and 100,
        "liked": true or false,
        "commented": true or false,
        "comment": "their actual comment if they commented, else null",
        "shared": true or false,
        "reason": "one sentence explaining why they reacted this way"
    }}
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
                        {"role": "system", "content": "You are a social media behavior simulator. Return only valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 2048
                },
                timeout=30.0
            )
            response.raise_for_status()

            result = response.json()
            response_text = result["result"]["response"]

            # Model may return already-parsed JSON (dict) or a string
            if isinstance(response_text, dict):
                return response_text

            start = response_text.find("{")
            end = response_text.rfind("}") + 1
            clean_json = response_text[start:end]

            try:
                return json.loads(clean_json)
            except json.JSONDecodeError as e:
                last_error = e
                continue

        raise ValueError(f"Model returned invalid JSON after 3 attempts: {last_error}")