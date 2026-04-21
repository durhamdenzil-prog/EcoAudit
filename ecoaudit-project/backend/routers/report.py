from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os
from models.schemas import EmissionRecord, ReportResponse
from services.report_service import report_service
from services.graph_service import graph_service

router = APIRouter()

@router.post("/generate", response_model=ReportResponse)
async def generate_report(supplier_filter: str = None):
    try:
        records_data = graph_service.get_total_emissions_by_supplier(supplier_filter)
        if not records_data:
            raise HTTPException(404, "No data found. Upload documents first.")
        records = [EmissionRecord(supplier_name=r["supplier"], product_name="Mixed",
            quantity=1, unit="aggregate", emission_value=r["total_emission"]) for r in records_data]
        return ReportResponse(**report_service.generate_cbam_report(records))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))

@router.get("/download/{filename}")
async def download(filename: str):
    path = os.path.join(os.getenv("REPORT_DIR", "./reports"), filename)
    if not os.path.exists(path):
        raise HTTPException(404, "Report not found")
    return FileResponse(path, media_type="application/pdf", filename=filename)