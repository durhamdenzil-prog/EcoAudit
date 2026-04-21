from fastapi import APIRouter, HTTPException
from services.graph_service import graph_service
from utils.emission_calculator import calculate_cbam_cost, CBAM_CARBON_PRICE_PER_TON_EUR

router = APIRouter()

@router.get("/stats")
async def stats():
    try:
        s = graph_service.get_dashboard_stats()
        total_kg = s.get("total_emissions", 0) or 0
        return {
            "total_emissions_kg": round(total_kg, 2),
            "total_emissions_tons": round(total_kg / 1000, 4),
            "total_cbam_cost_eur": calculate_cbam_cost(total_kg),
            "total_suppliers": s.get("total_suppliers", 0),
            "total_products": s.get("total_products", 0),
            "compliance_score": min(95.0, 60 + (s.get("total_suppliers", 0) * 5)),
            "carbon_price_eur": CBAM_CARBON_PRICE_PER_TON_EUR,
            "top_emitters": s.get("top_emitters", []),
        }
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/graph-data")
async def graph_data():
    try:
        suppliers = graph_service.run_cypher(
            "MATCH (s:Supplier) RETURN s.name AS name, id(s) AS id LIMIT 20"
        )
        products = graph_service.run_cypher(
            "MATCH (p:Product) RETURN p.name AS name, id(p) AS id LIMIT 20"
        )
        emissions = graph_service.run_cypher(
            "MATCH (e:EmissionEvent) RETURN e.emission_value AS value, id(e) AS id LIMIT 20"
        )
        relationships = graph_service.run_cypher("""
            MATCH (s:Supplier)-[r]->(target)
            RETURN s.name AS from_name,
                   id(s) AS from_id,
                   type(r) AS rel_type,
                   id(target) AS to_id,
                   labels(target)[0] AS to_type,
                   CASE
                     WHEN target:Product THEN target.name
                     WHEN target:EmissionEvent THEN toString(target.emission_value)
                     ELSE 'Unknown'
                   END AS to_name
            LIMIT 50
        """)
        return {
            "suppliers": suppliers,
            "products": products,
            "emissions": emissions,
            "relationships": relationships,
        }
    except Exception as e:
        raise HTTPException(500, str(e))