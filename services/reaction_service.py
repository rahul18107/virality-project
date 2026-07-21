import httpx
import os
import json
from dotenv import load_dotenv

load_dotenv()

ACCOUNT_ID = os.getenv("CLOUDFLARE_ACCOUNT_ID")
API_TOKEN = os.getenv("CLOUDFLARE_TOKEN")

    
def get_batch_reactions(personas: list, content: dict):
    
    # build one big prompt for all personas
    personas_text = ""
    for i, persona in enumerate(personas):
        personas_text += f"""
    Persona {i+1}:
    - Name: {persona['name']}
    - Age: {persona['age']}
    - Region: {persona['region']}
    - Interests: {', '.join(persona['interests'])}
    - Behavior: {persona['behavior']}
    - Engagement threshold: {persona['engagement_threshold']}
    """

    prompt = f"""
    You are simulating how different social media users react to a reel.

    The reel:
    - Title: {content['title']}
    - Description: {content['description']}
    - Category: {content['category']}
    - Duration: {content['duration_seconds']} seconds
    - Hook: {content['hook']}

    Here are {len(personas)} personas:
    {personas_text}

    For EACH persona, decide how they react based on their interests and behavior.
    
    Return ONLY a JSON array with {len(personas)} objects, one per persona, in order:
    [
        {{
            "name": "persona name",
            "watched_fully": true or false,
            "watch_percentage": 0-100,
            "liked": true or false,
            "commented": true or false,
            "comment": "their comment or null",
            "shared": true or false,
            "reason": "one sentence why"
        }}
    ]
    Return ONLY the JSON array, no extra text.
    """
    last_error = None
    for _ in range(3):
            with httpx.Client() as client:
                response = client.post(
                    f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/@cf/meta/llama-3.2-8b-instruct",
                    headers={"Authorization": f"Bearer {API_TOKEN}"},
                    json={
                        "messages": [
                            {"role": "system", "content": "You are a social media behavior simulator. Return only valid JSON arrays."},
                            {"role": "user", "content": prompt}
                        ],
                        "max_tokens": 400 * len(personas) + 200
                    },
                    timeout=60.0
                )

                if response.status_code != 200:
                    last_error = f"HTTP {response.status_code}: {response.text!r}"
                    continue

                result = response.json()

                if not result.get("success") or result.get("result") is None:
                    last_error = f"API error: {result.get('errors') or result!r}"
                    continue

                response_text = result["result"].get("response")
                if response_text is None:
                    last_error = f"No 'response' field: {result!r}"
                    continue

                if isinstance(response_text, dict):
                        return response_text

                start = response_text.find("[")
                end = response_text.rfind("]") + 1

                if start == -1 or end == 0:
                    last_error = f"No JSON array in response: {response_text!r}"
                    continue

                clean_json = response_text[start:end]

                try:
                    return json.loads(clean_json)
                except json.JSONDecodeError as e:
                    last_error = f"{e}. Raw: {response_text!r}"
                    continue

    raise ValueError(f"Model returned invalid JSON after 3 attempts: {last_error}")