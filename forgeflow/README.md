# ForgeFlow

> Turn product ideas, tickets, and PRDs into execution-ready software plans and starter implementations using a multi-agent AI system.

## What it does

Give ForgeFlow a product idea, stack preference, team size, and deadline.  
It runs a **6-agent pipeline** and returns:

| Output | Description |
|---|---|
| MVP Scope | In-scope features, out-of-scope cuts, milestones |
| Architecture | Components, DB schema, API routes, tech decisions |
| Code Scaffold | Folder tree, starter files with real code |
| Review | Risk gaps, score, recommendations |
| README + Demo | Full README, demo script, pitch points |

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python 3.11
- **Agents**: LangGraph (stateful multi-agent workflow)
- **LLM**: OpenAI API (swap `OPENAI_BASE_URL` to point at vLLM on AMD Developer Cloud)
- **Database**: SQLite (swap to Postgres via `DATABASE_URL`)

## Quick Start

### 1. Add your API key

```bash
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env and set OPENAI_API_KEY=sk-...
```

### 2. Run everything

```bash
chmod +x start.sh
./start.sh
```

Open **http://localhost:3000**

### Manual setup

**Backend:**
```bash
cd apps/api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd apps/web
cp .env.local.example .env.local
npm install
npm run dev
```

## Using vLLM on AMD Developer Cloud

To run inference on AMD Instinct MI300X GPUs instead of OpenAI:

```bash
# In apps/api/.env
OPENAI_BASE_URL=http://<your-amd-instance>:8000/v1
LLM_MODEL=Qwen/Qwen2-7B-Instruct
OPENAI_API_KEY=token  # any non-empty string
```

vLLM exposes an OpenAI-compatible API so the client code needs zero changes.

## Agent Pipeline

```
Input → Intake → PM → Architect → Scaffold → Reviewer → Delivery → Output Pack
```

1. **Intake Agent** — Parses idea, extracts product type, features, constraints
2. **PM Agent** — Defines MVP scope, milestones, success metrics
3. **Architect Agent** — Designs system components, DB schema, API routes
4. **Scaffold Agent** — Generates folder structure, starter code files
5. **Reviewer Agent** — Stress-tests the plan, finds gaps and risks
6. **Delivery Agent** — Writes README, demo script, pitch points

## API

| Endpoint | Method | Description |
|---|---|---|
| `/api/generate/` | POST | Start workflow, returns `project_id` |
| `/api/projects/` | GET | List all projects |
| `/api/projects/{id}` | GET | Get project + artifacts |
| `/health` | GET | Health check |
| `/docs` | GET | Swagger UI |

## Project Structure

```
forgeflow/
  apps/
    api/              # FastAPI backend
      agents/         # 6 LangGraph agent nodes
      graph/          # Workflow state + graph definition
      routes/         # HTTP endpoints
      services/       # LLM client, SQLite storage
    web/              # Next.js frontend
      app/            # Pages (landing, project view, history)
      components/     # OutputTabs, result panels
      lib/            # API client, utilities
  infra/
    docker/           # Docker Compose for deployment
  start.sh            # One-command dev startup
```
