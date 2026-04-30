# 🌱 EcoAudit | CCNLP-Based Carbon Footprint Analysis System

EcoAudit is a Cognitive Computing + NLP-powered SaaS platform that helps manufacturers analyze, track, and report carbon emissions across supply chains for CBAM (EU Carbon Border Adjustment Mechanism) compliance.

It converts unstructured data (PDFs, images, audio) into structured emission insights using AI, NLP, and Knowledge Graphs.

---

## 🚀 Quick Start

### Frontend Setup
```bash
npm install
npm run dev
```

### Backend Setup
```bash
uvicorn main:app --reload --port 8000
```

---

## ⚙️ Key Features

- 📄 Multimodal data ingestion (PDF, image, audio)
- 🧠 NLP-based emission extraction (spaCy + LLM)
- 🔗 Knowledge Graph using Neo4j
- 🔍 GraphRAG-based natural language querying
- 📊 Real-time carbon dashboard analytics
- 📑 Automated CBAM-compliant PDF report generation

---

## 🧠 Problem Statement

Manufacturers face major challenges:

- Scattered supply chain data (PDFs, invoices, audio, emails)
- Manual carbon tracking errors
- Lack of real-time emission insights
- Difficulty in CBAM compliance reporting
- No structured query system for supply chain analysis

---

## 🎯 Objectives

- Process multimodal industrial data (text, image, audio)
- Extract structured emission records using NLP
- Build supply chain knowledge graph (Neo4j)
- Enable natural language querying (GraphRAG)
- Generate automated CBAM reports (PDF)
- Provide real-time emission dashboard

---

## 🛠️ Tech Stack

### Frontend
- React.js + TypeScript + Vite
- Tailwind CSS
- Recharts

### Backend
- FastAPI (Python)
- Uvicorn

### AI / NLP
- spaCy (NER)
- OpenAI Whisper (Speech-to-Text)
- Llama3 (Ollama)
- GraphRAG pipeline

### Database
- Neo4j (Graph Database)

### Other Tools
- Tesseract OCR
- ReportLab (PDF generation)
- Pydantic v2

---

## 🏗️ System Architecture

1. User uploads PDF / Image / Audio  
2. Backend extracts raw text (OCR / Whisper)  
3. spaCy identifies entities (supplier, product, quantity)  
4. LLM converts data into structured emission records  
5. Data stored in Neo4j knowledge graph  
6. GraphRAG enables natural language querying  
7. Dashboard visualizes emissions in real-time  
8. CBAM report generated in PDF format  

---

## 📊 Core Modules

### 🔹 Ingestion API
- `/api/ingest/pdf`
- `/api/ingest/image`
- `/api/ingest/audio`

### 🔹 GraphRAG Query
- `/api/query/`

### 🔹 Dashboard
- `/api/dashboard/stats`
- `/api/dashboard/graph-data`

### 🔹 Report Generation
- `/api/report/generate`
- `/api/report/download/{filename}`

---

## 📂 Project Structure

```
backend/
 ├── main.py
 ├── routers/
 ├── services/
 ├── models/
 ├── utils/

frontend/
 ├── src/
 │   ├── pages/
 │   ├── components/
 │   ├── app/api.ts
```

---

## 📑 CBAM Report

- Generates EU-compliant carbon reports  
- Includes:
  - Total emissions  
  - Supplier breakdown  
  - Carbon cost estimation (€65/ton CO₂)  
- Downloadable PDF format  

---

## ⚠️ Limitations

- Requires local LLM (Ollama + Llama3)
- OCR accuracy depends on document quality
- Static emission factors (not real-time industry-specific)
- No authentication system yet

---

## 🚀 Future Scope

- Real-time carbon pricing API integration
- ERP system integration (SAP/Oracle)
- IoT-based emission tracking
- Multi-tenant SaaS architecture
- Mobile app for document scanning

---

## 🏁 Conclusion

EcoAudit demonstrates how AI + NLP + Knowledge Graphs can solve real-world industrial compliance problems like CBAM reporting, enabling automated, scalable, and intelligent carbon footprint analysis.

---

## 👨‍💻 Tech Stack Summary

FastAPI • React • Neo4j • spaCy • Whisper • Llama3 • Tesseract • ReportLab