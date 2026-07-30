# Virality Project

Simulates how a piece of content spreads across a network of AI personas, and scores its
virality. FastAPI backend + React/Vite frontend in one repo.

```
backend/    FastAPI app (personas, content, simulate routes)
frontend/   React + Vite UI with a ReactFlow spread graph
```

## Backend

Requires Python 3.11+ and `ffmpeg` on your PATH (used for audio extraction from video).

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate        # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # then fill in your API keys
uvicorn main:app --reload     # http://localhost:8000
```

## Frontend

Requires Node 18+.

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

The dev server proxies `/api/*` to `http://localhost:8000`, so run the backend first.

## API

| Method | Route           | Description                                  |
| ------ | --------------- | -------------------------------------------- |
| POST   | `/simulate/run` | Run the full simulation on uploaded content  |
|        | `/personas/*`   | Persona generation and retrieval             |
|        | `/content/*`    | Content analysis                             |
