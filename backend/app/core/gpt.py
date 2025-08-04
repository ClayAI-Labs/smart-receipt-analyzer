# gpt.py
from app.utils.async_utils import run_blocking
import os
import json
import re
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise RuntimeError("OPENAI_API_KEY is not set in environment variables or .env file.")

client = OpenAI(api_key=api_key)

prompt_template = """
You will be given raw OCR text from a receipt. Extract and return the following fields in strict JSON format:

{{
  "merchant": string,
  "date": string (YYYY-MM-DD),
  "items": [{{ "name": string, "quantity": int, "price": float }}],
  "total": float
}}

Respond with only valid JSON.

If the receipt date is missing, set "date" to "2025-08-01".

Text:
---
{ocr_text_data}
"""

async def extract_structured_data(ocr_text: str) -> dict:
    prompt = prompt_template.format(ocr_text_data=ocr_text.strip())

    try:
        result = await run_blocking(client.chat.completions.create,
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an intelligent receipt parser."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.0
        )

        print("Raw response object:", result, flush=True)
        print("DEBUG: Choices:", result.choices, flush=True)

        # Defensive: check if choices exist
        if not hasattr(result, "choices") or not result.choices:
            print("❌ No choices in OpenAI response!", flush=True)
            raise ValueError("No choices in OpenAI response.")

        content = result.choices[0].message.content.strip()
        print("📤 GPT RAW Output:")
        print(content, flush=True)

        match = re.search(r"\{[\s\S]*\}", content)
        if match:
            content = match.group(0).strip()
        else:
            print("❌ No valid JSON object found in GPT response.")
            raise ValueError("GPT output does not contain valid JSON.")

        return json.loads(content)

    except Exception as e:
        print("❌ Exception during GPT extraction:", str(e), flush=True)
        import traceback
        traceback.print_exc()
        print("📄 Raw GPT content (on exception):", content if 'content' in locals() else "No content", flush=True)


