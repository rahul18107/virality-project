# 🔮 Virality Predictor

> Simulate how your content spreads across an AI persona network — and get a virality score.

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=flat&logo=react&logoColor=black)
![Cloudflare Workers AI](https://img.shields.io/badge/Cloudflare-Workers_AI-F38020?style=flat&logo=cloudflare&logoColor=white)
![ReactFlow](https://img.shields.io/badge/ReactFlow-Spread_Graph-FF0072?style=flat)

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
