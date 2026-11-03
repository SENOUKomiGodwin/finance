from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv
import httpx

from assistant import DataQueryEngine, QueryResult
from insights import InsightGenerator

load_dotenv()

app = FastAPI(title="Financial AI Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engines
query_engine = DataQueryEngine()
insight_generator = InsightGenerator()

# Backend API URL
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:5000")

class QueryRequest(BaseModel):
    query: str
    dataset_id: Optional[str] = None
    data: Optional[List[Dict[str, Any]]] = None

class InsightRequest(BaseModel):
    dataset_id: Optional[str] = None
    data: Optional[List[Dict[str, Any]]] = None

class QueryResponse(BaseModel):
    answer: str
    data: Optional[List[Dict[str, Any]]] = None
    query_type: Optional[str] = None
    confidence: float = 1.0

class InsightResponse(BaseModel):
    insights: List[Dict[str, Any]]

async def fetch_dataset_data(dataset_id: str) -> List[Dict[str, Any]]:
    """Fetch dataset data from backend API"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{BACKEND_API_URL}/api/data/{dataset_id}",
                headers={"Authorization": f"Bearer {os.getenv('API_TOKEN', '')}"}
            )
            response.raise_for_status()
            data = response.json()
            return data.get('data', [])
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch dataset: {str(e)}")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Financial AI Service",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "ai-service"}

@app.post("/api/query", response_model=QueryResponse)
async def query_data(request: QueryRequest):
    """
    Query financial data using natural language.
    
    This endpoint processes natural language queries and returns answers
    based on the actual dataset data (zero hallucinations).
    """
    try:
        # Get data either from request or fetch from backend
        if request.data:
            data = request.data
        elif request.dataset_id:
            data = await fetch_dataset_data(request.dataset_id)
        else:
            raise HTTPException(status_code=400, detail="Either data or dataset_id must be provided")
        
        if not data:
            return QueryResponse(
                answer="No data available to query.",
                confidence=0.0
            )
        
        # Load data into query engine
        query_engine.load_data(data)
        
        # Parse and execute query
        result = query_engine.parse_natural_query(request.query)
        
        return QueryResponse(
            answer=result.answer,
            data=result.data,
            query_type=result.query_type,
            confidence=result.confidence
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query processing failed: {str(e)}")

@app.post("/api/insights", response_model=InsightResponse)
async def generate_insights(request: InsightRequest):
    """
    Generate automated insights from financial data.
    
    This endpoint analyzes the dataset and generates insights about
    revenue trends, expense patterns, anomalies, and more.
    """
    try:
        # Get data either from request or fetch from backend
        if request.data:
            data = request.data
        elif request.dataset_id:
            data = await fetch_dataset_data(request.dataset_id)
        else:
            raise HTTPException(status_code=400, detail="Either data or dataset_id must be provided")
        
        if not data:
            return InsightResponse(insights=[])
        
        # Load data into insight generator
        insight_generator.load_data(data)
        
        # Generate insights
        insights = insight_generator.generate_all_insights()
        
        # Convert to dict format
        insights_dict = [
            {
                "type": insight.type,
                "title": insight.title,
                "description": insight.description,
                "severity": insight.severity,
                "data": insight.data
            }
            for insight in insights
        ]
        
        return InsightResponse(insights=insights_dict)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Insight generation failed: {str(e)}")

@app.post("/api/llm-query")
async def llm_query(request: QueryRequest):
    """
    Query using LLM with dataset context (optional enhancement).
    
    This endpoint can be used to integrate with actual LLM APIs
    for more sophisticated natural language processing while
    maintaining zero hallucinations by providing dataset context.
    """
    try:
        # Get data
        if request.data:
            data = request.data
        elif request.dataset_id:
            data = await fetch_dataset_data(request.dataset_id)
        else:
            raise HTTPException(status_code=400, detail="Either data or dataset_id must be provided")
        
        if not data:
            return {"answer": "No data available to query."}
        
        # For now, use the rule-based query engine
        # This can be enhanced with actual LLM integration
        query_engine.load_data(data)
        result = query_engine.parse_natural_query(request.query)
        
        return {
            "answer": result.answer,
            "data": result.data,
            "query_type": result.query_type,
            "method": "rule_based"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM query failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
