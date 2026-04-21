import whisper
import os
import logging

logger = logging.getLogger(__name__)

class AudioService:
    def __init__(self):
        logger.info("Loading Whisper model...")
        self.model = whisper.load_model("base")

    def transcribe(self, file_path: str) -> dict:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Audio file not found: {file_path}")
        result = self.model.transcribe(file_path, language="en", verbose=False)
        return {
            "text": result["text"].strip(),
            "segments": result.get("segments", []),
            "language": result.get("language", "en"),
        }

audio_service = AudioService()