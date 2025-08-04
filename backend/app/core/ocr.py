# ocr.py
from app.utils.async_utils import run_blocking
from PIL import Image
from pdf2image import convert_from_bytes
import pytesseract
import io

async def extract_text_from_image(image_bytes: bytes) -> str:
    image = Image.open(io.BytesIO(image_bytes))
    return await run_blocking(pytesseract.image_to_string, image)

async def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    pages = convert_from_bytes(pdf_bytes)
    full_text = ""
    for page in pages:
        text = await run_blocking(pytesseract.image_to_string, page)
        full_text += text + "\n"
    return full_text
