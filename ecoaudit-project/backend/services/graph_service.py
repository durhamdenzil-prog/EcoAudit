from neo4j import GraphDatabase
import os
import logging
from models.schemas import EmissionRecord

logger = logging.getLogger(__name__)

class GraphService:
    def __init__(self):
        self.driver = None
        try:
            self.driver = GraphDatabase.driver(
                os.getenv("NEO4J_URI", "bolt://localhost:7687"),
                auth=(os.getenv("NEO4J_USER", "neo4j"), os.getenv("NEO4J_PASSWORD", "ecoaudit123"))
            )
            self.driver.verify_connectivity()
            logger.info("Neo4j connected ✅")
        except Exception as e:
            logger.error(f"Neo4j connection failed: {e}")

    def create_emission_event(self, record: EmissionRecord, document_id: str = ""):
        with self.driver.session() as s:
            s.run("""
                MERGE (sup:Supplier {name: $sname})
                MERGE (prod:Product {name: $pname})
                CREATE (e:EmissionEvent {
                    id: randomUUID(),
                    emission_value: $emission,
                    quantity: $qty,
                    unit: $unit,
                    date: $date,
                    document_id: $doc_id,
                    created_at: datetime()
                })
                MERGE (sup)-[:SUPPLIES]->(prod)
                CREATE (sup)-[:EMITS]->(e)
                CREATE (e)-[:FROM_PRODUCT]->(prod)
            """, sname=record.supplier_name, pname=record.product_name,
                emission=record.emission_value, qty=record.quantity,
                unit=record.unit, date=record.date or "", doc_id=document_id)

    def get_total_emissions_by_supplier(self, supplier_name=None):
        with self.driver.session() as s:
            if supplier_name:
                r = s.run("""
                    MATCH (s:Supplier)-[:EMITS]->(e:EmissionEvent)
                    WHERE toLower(s.name) CONTAINS toLower($name)
                    RETURN s.name AS supplier, sum(e.emission_value) AS total_emission
                """, name=supplier_name)
            else:
                r = s.run("""
                    MATCH (s:Supplier)-[:EMITS]->(e:EmissionEvent)
                    RETURN s.name AS supplier, sum(e.emission_value) AS total_emission
                    ORDER BY total_emission DESC
                """)
            return [{"supplier": rec["supplier"], "total_emission": rec["total_emission"]} for rec in r]

    def get_dashboard_stats(self):
        with self.driver.session() as s:
            total = s.run("MATCH (e:EmissionEvent) RETURN sum(e.emission_value) AS t").single()["t"] or 0
            suppliers = s.run("MATCH (s:Supplier) RETURN count(s) AS c").single()["c"]
            products = s.run("MATCH (p:Product) RETURN count(p) AS c").single()["c"]
            top = [dict(r) for r in s.run("""
                MATCH (s:Supplier)-[:EMITS]->(e:EmissionEvent)
                RETURN s.name AS supplier, sum(e.emission_value) AS emission
                ORDER BY emission DESC LIMIT 5
            """)]
            return {"total_emissions": total, "total_suppliers": suppliers, "total_products": products, "top_emitters": top}

    def run_cypher(self, cypher: str):
        with self.driver.session() as s:
            return [dict(r) for r in s.run(cypher)]

graph_service = GraphService()