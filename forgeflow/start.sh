#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "==> ForgeFlow startup"

# ---- Backend ----
echo ""
echo "[1/2] Starting FastAPI backend..."
cd "$ROOT/apps/api"

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "  Created apps/api/.env — add your OPENAI_API_KEY"
fi

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
  echo "  Created virtualenv"
fi

source .venv/bin/activate
pip install -q -r requirements.txt
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
echo "  Backend running at http://localhost:8000 (PID $BACKEND_PID)"

# ---- Frontend ----
echo ""
echo "[2/2] Starting Next.js frontend..."
cd "$ROOT/apps/web"

if [ ! -f ".env.local" ]; then
  cp .env.local.example .env.local
fi

if [ ! -d "node_modules" ]; then
  npm install
fi

npm run dev &
FRONTEND_PID=$!
echo "  Frontend running at http://localhost:3000 (PID $FRONTEND_PID)"

echo ""
echo "ForgeFlow is up!"
echo "  App:  http://localhost:3000"
echo "  API:  http://localhost:8000"
echo "  Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
