from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

class FileType(str, Enum):
    PDF = "pdf"
    IMAGE = "image"
    AUDIO = "audio"

class EmissionRecord(BaseModel):
    supplier_name: str
    product_name: str
    quantity: float
    unit: str
    emission_value: float
    emission_factor: Optional[float] = None
    source_document: Optional[str] = None
    date: Optional[str] = None

class IngestResponse(BaseModel):
    status: str
    file_id: str
    file_type: FileType
    extracted_text: str
    entities: dict
    emission_records: List[EmissionRecord]
    graph_nodes_created: int
    message: str

class QueryRequest(BaseModel):
    question: str = Field(..., example="Total emissions from ABC Steel?")
    supplier_filter: Optional[str] = None

class QueryResponse(BaseModel):
    question: str
    cypher_query: str
    raw_results: list
    answer: str

class ReportResponse(BaseModel):
    report_id: str
    file_path: str
    filename: str
    total_emissions_kg: float
    total_cbam_cost_eur: float
    suppliers_included: int
    generated_at: str