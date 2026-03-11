from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
from dotenv import load_dotenv
from groq import Groq

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="FireReach Autonomous Outreach System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RunAgentRequest(BaseModel):
    company: str
    icp: str
    email: str

class RunAgentResponse(BaseModel):
    company: str
    signals: List[str]
    account_brief: str
    generated_email: str

# Initialize Groq client
# It automatically looks for the GROQ_API_KEY environment variable.
try:
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
except Exception:
    client = None

def tool_signal_harvester(company: str) -> List[str]:
    """Simulates harvesting signals for a company."""
    return [
        f"{company} recently raised Series A funding.",
        f"{company} is actively hiring software engineers.",
        f"{company} just launched a new product line."
    ]

def tool_research_analyst(signals: List[str], icp: str) -> str:
    """Uses Groq Llama3 model to generate an account brief based on signals and ICP."""
    if not client:
        return "Error: GROQ_API_KEY is missing or invalid."
        
    prompt = (
        f"Given the following company signals and ideal customer profile (ICP), "
        f"generate a short account brief explaining why this company could benefit from the product.\n\n"
        f"Signals: {', '.join(signals)}\n"
        f"ICP: {icp}"
    )
    
    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3-8b-8192",
            temperature=0.7,
            max_tokens=256,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error generating brief: {str(e)}"

def tool_outreach_automated_sender(brief: str, email: str) -> str:
    """Uses Groq to generate a personalized outreach email."""
    if not client:
        return "Error: GROQ_API_KEY is missing or invalid."
        
    prompt = (
        f"Write a personalized cold outreach email for {email}. "
        f"The email must reference the following account brief and its signals to explain "
        f"why we are reaching out. Keep it concise, professional, and end with a call to action.\n\n"
        f"Account Brief:\n{brief}"
    )
    
    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3-8b-8192",
            temperature=0.7,
            max_tokens=300,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error generating email: {str(e)}"

@app.post("/run-agent", response_model=RunAgentResponse)
async def run_agent(request: RunAgentRequest):
    """
    Executes the FireReach autonomous agent chain.
    """
    # 1. Gather signals
    signals = tool_signal_harvester(request.company)
    
    # 2. Analyze research and generate brief
    brief = tool_research_analyst(signals, request.icp)
    
    # 3. Generate outreach email
    generated_email = tool_outreach_automated_sender(brief, request.email)
    
    return RunAgentResponse(
        company=request.company,
        signals=signals,
        account_brief=brief,
        generated_email=generated_email
    )
