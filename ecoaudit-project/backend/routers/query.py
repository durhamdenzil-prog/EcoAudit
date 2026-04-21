from fastapi import APIRouter, HTTPException
from models.schemas import QueryRequest, QueryResponse
from services.graphrag_service import graphrag_service

router = APIRouter()

@router.post("/", response_model=QueryResponse)
async def query(request: QueryRequest):
    try:
        return QueryResponse(**graphrag_service.query(request.question))
    except Exception as e:
        raise HTTPException(500, str(e))

@router.get("/suggestions")
async def suggestions():
    return {"suggestions": [
        "What is the total carbon emission from all suppliers?",
        "Which supplier has the highest emissions?",
        "List all products and their emission values",
        "How many suppliers are in the database?",
        "Show top 5 emitters",
    ]}