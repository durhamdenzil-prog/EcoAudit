import pytesseract
from PIL import Image
import fitz
import io
import logging

logger = logging.getLogger(__name__)
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

class OCRService:
    def extract_from_pdf(self, file_path: str) -> str:
        extracted_text = ""
        try:
            doc = fitz.open(file_path)
            for page_num, page in enumerate(doc):
                native_text = page.get_text()
                if native_text.strip():
                    extracted_text += f"\n--- Page {page_num + 1} ---\n{native_text}"
                else:
                    mat = fitz.Matrix(300 / 72, 300 / 72)
                    pix = page.get_pixmap(matrix=mat)
                    img = Image.open(io.BytesIO(pix.tobytes("png")))
                    extracted_text += f"\n--- Page {page_num + 1} (OCR) ---\n{pytesseract.image_to_string(img)}"
            doc.close()
        except Exception as e:
            logger.error(f"PDF error: {e}")
            raise
        return extracted_text.strip()

    def extract_from_image(self, file_path: str) -> str:
        try:
            image = Image.open(file_path)
            if image.mode not in ("RGB", "L"):
                image = image.convert("RGB")
            return pytesseract.image_to_string(image, config="--oem 3 --psm 6").strip()
        except Exception as e:
            logger.error(f"Image OCR error: {e}")
            raise

ocr_service = OCRService()