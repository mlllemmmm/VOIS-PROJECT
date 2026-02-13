from openai import OpenAI
import os

print("Using key:", os.environ.get("OPENAI_API_KEY"))

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

try:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "user", "content": "Hello"}
        ]
    )
    print("SUCCESS:", response.choices[0].message.content)

except Exception as e:
    print("ERROR:", e)
