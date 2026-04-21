from fastapi import APIRouter, UploadFile, File, HTTPException
import os, uuid, shutil, logging
from models.schemas import IngestResponse, FileType
from services.ocr_service import ocr_service
from services.audio_service import audio_service
from services.nlp_service import nlp_service
from services.graph_service import graph_service

router = APIRouter()
logger = logging.getLogger(__name__)
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_file(file: UploadFile, file_id: str) -> str:
    ext = os.path.splitext(file.filename)[1]
    path = os.path.join(UPLOAD_DIR, f"{file_id}{ext}")
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return path

@router.post("/pdf", response_model=IngestResponse)
async def ingest_pdf(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())[:8]
    path = save_file(file, file_id)
    try:
        text = ocr_service.extract_from_pdf(path)
        entities = nlp_service.extract_entities_spacy(text)
        records = nlp_service.extract_emission_data_llm(text)
        for r in records:
            graph_service.create_emission_event(r, file_id)
        return IngestResponse(status="success", file_id=file_id, file_type=FileType.PDF,
            extracted_text=text[:500], entities=entities, emission_records=records,
            graph_nodes_created=len(records)*3, message=f"Extracted {len(records)} records.")
    except Exception as e:
        raise HTTPException(500, str(e))

@router.post("/image", response_model=IngestResponse)
async def ingest_image(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())[:8]
    path = save_file(file, file_id)
    try:
        text = ocr_service.extract_from_image(path)
        entities = nlp_service.extract_entities_spacy(text)
        records = nlp_service.extract_emission_data_llm(text)
        for r in records:
            graph_service.create_emission_event(r, file_id)
        return IngestResponse(status="success", file_id=file_id, file_type=FileType.IMAGE,
            extracted_text=text[:500], entities=entities, emission_records=records,
            graph_nodes_created=len(records)*3, message=f"Extracted {len(records)} records.")
    except Exception as e:
        raise HTTPException(500, str(e))

@router.post("/audio", response_model=IngestResponse)
async def ingest_audio(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())[:8]
    path = save_file(file, file_id)
    try:
        transcription = audio_service.transcribe(path)
        text = transcription["text"]
        entities = nlp_service.extract_entities_spacy(text)
        records = nlp_service.extract_emission_data_llm(text)
        for r in records:
            graph_service.create_emission_event(r, file_id)
        return IngestResponse(status="success", file_id=file_id, file_type=FileType.AUDIO,
            extracted_text=text[:500], entities=entities, emission_records=records,
            graph_nodes_created=len(records)*3, message=f"Extracted {len(records)} records.")
    except Exception as e:
        raise HTTPException(500, str(e))