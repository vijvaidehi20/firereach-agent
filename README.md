# FireReach Autonomous Outreach Prototype

A minimal prototype of an **agentic outreach system** that researches a company and generates a personalized outreach email based on signals and an Ideal Customer Profile (ICP).

## Features

* Captures example company signals
* Generates an account brief using LLM (Groq / Llama3)
* Creates a personalized outreach email
* Simple React UI for running the agent
* FastAPI backend for the agent pipeline

## Tech Stack

* **Backend:** FastAPI (Python)
* **Frontend:** React (Vite)
* **LLM:** Groq API (Llama 3)
* **API Communication:** REST

## Agent Workflow

Signal Harvesting → Research Analysis → Email Generation

## Running Locally

Backend:

```bash
pip install fastapi uvicorn groq
uvicorn main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Then open:

```
http://localhost:5173
```
