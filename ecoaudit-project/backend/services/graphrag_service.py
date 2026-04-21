import requests
import json
import logging
from services.graph_service import graph_service

logger = logging.getLogger(__name__)
OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL = "llama3"

class GraphRAGService:
    def query(self, question: str) -> dict:
        cypher = self._generate_cypher(question)
        try:
            results = graph_service.run_cypher(cypher)
        except Exception as e:
            results = []
        answer = self._generate_answer(question, cypher, results)
        return {"question": question, "cypher_query": cypher, "raw_results": results, "answer": answer}

    def _generate_cypher(self, question: str) -> str:
        prompt = f"""You are a Neo4j Cypher expert for a carbon emissions graph.
Nodes: Supplier(name), Product(name), EmissionEvent(emission_value, quantity, unit, date)
Relationships: (Supplier)-[:SUPPLIES]->(Product), (Supplier)-[:EMITS]->(EmissionEvent), (EmissionEvent)-[:FROM_PRODUCT]->(Product)
Return ONLY the Cypher query, no explanation, no backticks.

Question: {question}
Cypher:"""
        try:
            r = requests.post(f"{OLLAMA_BASE_URL}/api/generate",
                json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False, "options": {"temperature": 0.0}},
                timeout=30)
            cypher = r.json().get("response", "").strip().split("\n")[0]
            return cypher.replace("```", "").strip() or self._fallback_cypher(question)
        except:
            return self._fallback_cypher(question)

    def _generate_answer(self, question: str, cypher: str, results: list) -> str:
        if not results:
            return "No data found. Please upload documents first."
        prompt = f"""Carbon emissions expert. Question: {question}
Results: {json.dumps(results[:5])}
Give a clear 2-3 sentence answer with numbers and units."""
        try:
            r = requests.post(f"{OLLAMA_BASE_URL}/api/generate",
                json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False, "options": {"temperature": 0.3}},
                timeout=30)
            return r.json().get("response", "").strip()
        except:
            return f"Found {len(results)} result(s): {json.dumps(results[:2])}"

    def _fallback_cypher(self, question: str) -> str:
        q = question.lower()
        if "total" in q and "emission" in q:
            return "MATCH (s:Supplier)-[:EMITS]->(e:EmissionEvent) RETURN s.name AS supplier, sum(e.emission_value) AS total ORDER BY total DESC"
        elif "supplier" in q:
            return "MATCH (s:Supplier) RETURN s.name AS supplier LIMIT 20"
        elif "product" in q:
            return "MATCH (p:Product) RETURN p.name AS product LIMIT 20"
        return "MATCH (s:Supplier)-[:EMITS]->(e:EmissionEvent) RETURN s.name, e.emission_value LIMIT 20"

graphrag_service = GraphRAGService()