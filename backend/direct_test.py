import requests
import os

headers = {
    "Authorization": f"Bearer {os.environ.get('OPENAI_API_KEY')}"
}

try:
    r = requests.get("https://api.openai.com/v1/models", headers=headers)
    print("Status:", r.status_code)
    print("Response:", r.text[:200])
except Exception as e:
    print("ERROR:", e)
