import spacy
import requests
import json
import re
import logging
from models.schemas import EmissionRecord

logger = logging.getLogger(__name__)
OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL = "llama3"

class NLPService:
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except:
            self.nlp = None

    def extract_entities_spacy(self, text: str) -> dict:
        if not self.nlp:
            return {}
        doc = self.nlp(text)
        entities = {"organizations": [], "quantities": [], "dates": [], "locations": [], "products": []}
        for ent in doc.ents:
            if ent.label_ == "ORG": entities["organizations"].append(ent.text)
            elif ent.label_ in ("QUANTITY", "CARDINAL"): entities["quantities"].append(ent.text)
            elif ent.label_ == "DATE": entities["dates"].append(ent.text)
            elif ent.label_ in ("GPE", "LOC"): entities["locations"].append(ent.text)
            elif ent.label_ == "PRODUCT": entities["products"].append(ent.text)
        for k in entities:
            entities[k] = list(set(entities[k]))
        return entities

    def extract_emission_data_llm(self, text: str) -> list:
        prompt = f"""Extract carbon emission records from this document.
Return ONLY a valid JSON array. No explanations. No markdown.
Each record must have: supplier_name, product_name, quantity (number), unit (string), emission_value (number in kg CO2e).
If no data found return [].

Document:
{text[:2000]}

JSON:"""
        try:
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False, "options": {"temperature": 0.1}},
                timeout=60,
            )
            raw = response.json().get("response", "[]").strip()
            raw = re.sub(r"```(?:json)?", "", raw).strip().rstrip("```").strip()
            data = json.loads(raw)
            return [EmissionRecord(**item) for item in data if isinstance(item, dict)]
        except:
            return self._fallback(text)

    def _fallback(self, text: str) -> list:
        records = []
        suppliers = re.findall(r"(?:supplier|vendor)[:\s]+([A-Za-z\s&]+?)(?:,|\n)", text, re.I)
        emissions = re.findall(r"(\d+(?:\.\d+)?)\s*(?:kg|tons?)\s*(?:CO2|carbon)", text, re.I)
        for i in range(max(len(suppliers), len(emissions), 1)):
            records.append(EmissionRecord(
                supplier_name=suppliers[i].strip() if i < len(suppliers) else "Unknown",
                product_name="Unknown Product",
                quantity=1.0, unit="unit",
                emission_value=float(emissions[i]) if i < len(emissions) else 0.0,
            ))
        return records

nlp_service = NLPService()