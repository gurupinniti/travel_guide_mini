from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import requests
import json
import uvicorn
import logging

# -------------------------------
# Logging configuration
# -------------------------------
LOG_FORMAT = "%(asctime)s - %(levelname)s - %(name)s - %(message)s"
logging.basicConfig(
    level=logging.INFO,  # Change to DEBUG for more verbosity
    format=LOG_FORMAT,
    filename="../logs/backend.log",
    filemode="a",
)
log = logging.getLogger("OmioMiniBackend")

# -------------------------------
# FastAPI initialization
# -------------------------------
app = FastAPI(title="Omio-Mini Travel Assistant")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # replace with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Request/Response Models
# -------------------------------


class Message(BaseModel):
    role: str
    content: str


class ConversationRequest(BaseModel):
    message: str
    history: Optional[List[Message]] = []


class ModelStatusResponse(BaseModel):
    connected: bool
    model: str
    error: Optional[str] = None


class ConversationResponse(BaseModel):
    response: str


class TravelRequest(BaseModel):
    origin: str
    destination: str
    travel_date: Optional[str] = None
    passengers: Optional[int] = 1


class TravelPlanResponse(BaseModel):
    plan: str
    raw_model_response: Optional[str] = None

# -------------------------------
# Local LLM Client
# -------------------------------


class LocalLLM:
    def __init__(self, base_url="http://localhost:8000/v1", model="TinyLlama-1.1B-Chat-v1.0", timeout=600):
        # def __init__(self, base_url="http://localhost:8000/v1", model="MPT-7B-Instruct", timeout=600):
        self.base_url = base_url
        self.model = model
        self.timeout = timeout
        # self.headers = {
        #     "Content-Type": "application/json",
        #     "Authorization": "Bearer sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
        # }
        self.headers = {"Content-Type": "application/json"}

    def _post(self, url, data):
        response = requests.post(
            url, headers=self.headers, data=json.dumps(data), timeout=self.timeout
        )
        response.raise_for_status()
        return response.json()

    async def chat(self, messages, max_tokens=1000):
        """Chat completion with the local LLM"""
        url = f"{self.base_url}/chat/completions"
        data = {"model": self.model, "messages": messages,
                "max_tokens": max_tokens}
        log.info(f"Api triggered: {url}")
        log.info(f"Parameters: {data}")
        try:
            result = self._post(url, data)
            return result["choices"][0]["message"]["content"]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"LLM error: {str(e)}")

# -------------------------------
# Assistant Agent
# -------------------------------


TRAVEL_SYSTEM_PROMPT = """
You are Omio Mini, a travel assistant.

Precursors : If users greets Hello. Then reply Hello, how may I assist with you on the travel?

Guidelines:
1. Greet the user briefly if they say hello, e.g. "Hello! How can I help you plan your travel today?"
2. Always ask for travel details (origin, destination, date, passengers) if not provided.
3. Provide travel options in a **Markdown table**:

Mode | Departure | Arrival | Duration | Price

4. Optionally, show a **simple ASCII map** of the route:
   Singapore ••••• Kuala Lumpur (Bus: 400 km, $25)

5. Keep your responses concise, clear, and relevant.
6. Never provide marketing content, verbose explanations, or unrelated advice.
7. Use short sentences and lists when possible.
9. Provide only trusted and latest sources.
"""


class LocalLLMAssistantAgent:
    def __init__(self, llm, system_message):
        self.llm = llm
        self.system_message = system_message

    async def generate_reply(self, messages: Optional[List[Dict]] = None):
        """Generate reply using the conversation history"""
        if not messages:
            messages = [{"role": "user", "content": "Hello"}]

        # Prepend system message
        chat_messages = [{"role": "system", "content": self.system_message}]
        chat_messages.extend(messages)

        reply = await self.llm.chat(chat_messages)
        log.info("---------------------------------------------------------")
        log.info(f"generated response: \n{reply}")
        log.info("---------------------------------------------------------")
        return reply


# -------------------------------
# Initialize LLM + Agent
# -------------------------------
llm = LocalLLM()
assistant_agent = LocalLLMAssistantAgent(
    llm=llm, system_message=TRAVEL_SYSTEM_PROMPT)

# -------------------------------
# Routes
# -------------------------------


@app.get("/api/status", response_model=ModelStatusResponse)
async def check_status():
    """Check if the LLM server is available"""
    try:
        url = f"{llm.base_url}/models"
        resp = requests.get(url, headers=llm.headers, timeout=10)
        resp.raise_for_status()
        models = resp.json().get("data", [])
        model_found = any(m.get("id") == llm.model for m in models)
        return {"connected": True, "model": llm.model if model_found else "Unknown"}
    except Exception as e:
        return {"connected": False, "model": "", "error": str(e)}


@app.post("/api/chat", response_model=ConversationResponse)
async def chat(request: ConversationRequest = Body(...)):
    log.info("API entry point")
    """Generic chat with assistant"""
    messages = [{"role": msg.role, "content": msg.content}
                for msg in request.history]
    messages.append({"role": "user", "content": request.message})
    response = await assistant_agent.generate_reply(messages)
    log.info(f"Complete response: {response}")
    return {"response": response}


@app.post("/api/travel", response_model=TravelPlanResponse)
async def plan_trip(request: TravelRequest):
    """
    Travel planning endpoint (Omio-mini style).
    Example:
    {
        "origin": "Singapore",
        "destination": "Kuala Lumpur",
        "travel_date": "2025-09-20",
        "passengers": 2
    }
    """
    user_prompt = (
        f"Plan a trip from {request.origin} to {request.destination}. "
        f"Date: {request.travel_date or 'anytime soon'}, "
        f"Passengers: {request.passengers}. "
        f"Suggest options like bus, train, flight with approximate cost and time. "
        f"Keep response structured and clear."
    )

    messages = [{"role": "system", "content": "You are a travel planner AI like Omio."},
                {"role": "user", "content": user_prompt}]

    response = await llm.chat(messages)
    return {"plan": response, "raw_model_response": response}

# -------------------------------
# Run FastAPI
# -------------------------------
# if __name__ == "__main__":
#     uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
