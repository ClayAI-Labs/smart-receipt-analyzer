# routes.py
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

# For Text extraction and GPT processing
from app.core.ocr import extract_text_from_image, extract_text_from_pdf
from app.core.gpt import extract_structured_data

# For Pydantic validation
from app.core.schema import ReceiptData

# For database models and session management
from app.core.models import Receipt, Item
from app.utils.db import get_session

# For user authentication
from app.core.dependencies import get_current_user
from uuid import uuid4, UUID
from sqlmodel import select, Session

router = APIRouter()

@router.post("/extract")
async def extract_receipt(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user)
):
    try:
        contents = await file.read()
        print(f"📥 Received file: {file.filename}")

        if file.filename.endswith(".pdf"):
            ocr_text = await extract_text_from_pdf(contents)
        else:
            ocr_text = await extract_text_from_image(contents)

        print("🧾 OCR Output:")
        print(ocr_text)

        gpt_output = await extract_structured_data(ocr_text)

        print("📤 GPT Output:")
        print(gpt_output)

        if gpt_output.get("date", "") == "":
            print("⚠️ Date missing, setting fallback value.")
            gpt_output["date"] = "2025-08-02"

        # ✅ Pydantic validation here
        try:
            validated = ReceiptData.model_validate(gpt_output)
            print("✅ Parsed & validated receipt data.")
        except Exception as e:
            print("❌ GPT output did not match schema:", str(e))
            raise HTTPException(status_code=422, detail="Invalid GPT output schema.")

        # ✅ Save to DB
        receipt_id = uuid4()

        # Save Receipt row
        receipt = Receipt(
            id=receipt_id,
            user_id=current_user.id,
            filename=file.filename,
            merchant=validated.merchant,
            date=validated.date,
            total=validated.total,
            raw_ocr_text=ocr_text
        )
        session.add(receipt)

        # Save related Items
        for item in validated.items:
            db_item = Item(
                receipt_id=receipt_id,
                name=item.name,
                quantity=item.quantity,
                price=item.price
            )
            session.add(db_item)

        session.commit()
        print("💾 Saved receipt and items to database.")

        return JSONResponse(content=jsonable_encoder(validated.model_dump()))

    except Exception as e:
        print("❌ ERROR during extraction:", str(e))
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")


@router.get("/receipts")
def get_all_receipts(
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user)
):
    try:
        statement = select(Receipt).where(Receipt.user_id == current_user.id)
        receipts = session.exec(statement).all()

        results = []
        for receipt in receipts:
            items = session.exec(select(Item).where(Item.receipt_id == receipt.id)).all()
            results.append({
                "id": str(receipt.id),
                "filename": receipt.filename,
                "merchant": receipt.merchant,
                "date": str(receipt.date),
                "total": receipt.total,
                "items": [
                    {
                        "name": item.name,
                        "quantity": item.quantity,
                        "price": item.price
                    } for item in items
                ],
                "created_at": str(receipt.created_at)
            })

        return results
    except Exception as e:
        print("❌ ERROR during get_all_receipts:", str(e))
        raise HTTPException(status_code=500, detail="Failed to retrieve receipts")


@router.delete("/receipts/{receipt_id}")
def delete_receipt(
    receipt_id: UUID,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user)
):
    receipt = session.get(Receipt, receipt_id)
    if not receipt or receipt.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Receipt not found")

    # Delete all related items first
    items = session.exec(select(Item).where(Item.receipt_id == receipt_id)).all()
    for item in items:
        session.delete(item)

    session.delete(receipt)
    session.commit()
    return {"message": "Receipt deleted"}
