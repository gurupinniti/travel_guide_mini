from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict
import requests
import json
import asyncio

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
# Local + GeminAI Hybrid LLM Client
# -------------------------------


class LocalLLM:
    """Local TinyLlama client (simulate local model)"""

    def __init__(self, model_name="TinyLlama-1.1B-Chat-v1.0"):
        self.model_name = model_name

    async def chat(self, messages, max_tokens=300):
        """Simulate local model. Replace with your TinyLlama API if available."""
        # For demo, simply echo user content
        return f"[TinyLlama] {messages[-1]['content']}"


class HybridLLM:
    """Hybrid LLM: local first, fallback to GeminAI API"""

    def __init__(self, local_model=None, geminai_api_key=None):
        self.local_model = local_model
        self.geminai_api_key = geminai_api_key

    async def chat(self, messages, max_tokens=300, stream=False):
        prompt = "\n".join(
            [f"[{msg['role'].upper()}]: {msg['content']}" for msg in messages])

        # --- Try local model ---
        if self.local_model:
            try:
                response = await self.local_model.chat(messages, max_tokens=max_tokens)
                # Check if response is good enough
                if response and len(response) > 10:
                    return response
            except Exception as e:
                print(f"Local model error: {e}")

        # --- Fallback to GeminAI ---
        if self.geminai_api_key:
            try:
                headers = {"Authorization": f"Bearer {self.geminai_api_key}",
                           "Content-Type": "application/json"}
                data = {
                    "prompt": prompt,
                    "max_tokens": max_tokens,
                    "temperature": 0.7,
                }
                r = requests.post(
                    "https://api.geminai.com/v1/completions", headers=headers, json=data)
                r.raise_for_status()
                return r.json()["choices"][0]["text"]
            except Exception as e:
                raise HTTPException(
                    status_code=500, detail=f"GeminAI API error: {str(e)}")

        return "Sorry, no response could be generated."

# -------------------------------
# System prompt
# -------------------------------


TRAVEL_SYSTEM_PROMPT = """
You are Omio Mini, a travel assistant.

Guidelines:
1. Greet the user briefly if they say hello: "Hello! How can I help you plan your travel today?"
2. Ask for travel details if not provided (origin, destination, date, passengers).
3. Provide travel options in a **Markdown table**:

Mode | Departure | Arrival | Duration | Price

4. Optionally, show a **simple ASCII map** of the route:
   Singapore ••••• Kuala Lumpur (Bus: 400 km, $25)

5. Keep responses concise, clear, and relevant.
6. Never provide marketing content or verbose explanations.
7. Use short sentences and lists when possible.
"""

# -------------------------------
# Assistant Agent
# -------------------------------


class AssistantAgent:
    def __init__(self, llm, system_prompt):
        self.llm = llm
        self.system_prompt = system_prompt

    async def generate_reply(self, messages: Optional[List[Dict]] = None, stream=False):
        if not messages:
            messages = [{"role": "user", "content": "Hello"}]

        chat_messages = [{"role": "system", "content": self.system_prompt}]
        chat_messages.extend(messages)

        if stream:
            async def generator():
                # Streaming not implemented for GeminAI; yielding full response
                response = await self.llm.chat(chat_messages)
                for chunk in response.split():
                    yield chunk + " "
            return generator()
        else:
            return await self.llm.chat(chat_messages)

# -------------------------------
# Initialize Hybrid LLM + Agent
# -------------------------------


local_model = LocalLLM(model_name="TinyLlama-1.1B-Chat-v1.0")
llm = HybridLLM(local_model=local_model, geminai_api_key="YOUR_GEMINAI_KEY")
assistant_agent = AssistantAgent(llm, TRAVEL_SYSTEM_PROMPT)

# -------------------------------
# Routes
# -------------------------------


@app.get("/api/status", response_model=ModelStatusResponse)
async def check_status():
    """Check if LLM is available"""
    connected = True if llm else False
    return {"connected": connected, "model": "TinyLlama + GeminAI", "error": None}


@app.post("/api/chat", response_model=ConversationResponse)
async def chat(request: ConversationRequest = Body(...)):
    messages = [{"role": msg.role, "content": msg.content}
                for msg in request.history]
    messages.append({"role": "user", "content": request.message})
    response = await assistant_agent.generate_reply(messages)
    return {"response": response}


@app.post("/api/chat_stream")
async def chat_stream(request: ConversationRequest = Body(...)):
    messages = [{"role": msg.role, "content": msg.content}
                for msg in request.history]
    messages.append({"role": "user", "content": request.message})
    generator = await assistant_agent.generate_reply(messages, stream=True)
    return StreamingResponse(generator, media_type="text/plain")


@app.post("/api/travel", response_model=TravelPlanResponse)
async def plan_trip(request: TravelRequest):
    user_prompt = (
        f"Plan a trip from {request.origin} to {request.destination}. "
        f"Date: {request.travel_date or 'anytime soon'}, "
        f"Passengers: {request.passengers}. "
        f"Suggest options like bus, train, flight with approximate cost and time. "
        f"Keep response structured, concise, and in Markdown table if possible."
    )
    messages = [
        {"role": "system", "content": TRAVEL_SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt}
    ]
    response = await llm.chat(messages)
    return {"plan": response, "raw_model_response": response}
