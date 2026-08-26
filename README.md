
# 🔮 Virality Predictor

> Simulate how your content spreads across an AI persona network — and get a virality score.

## 🖼️ Overview

![Virality Predictor Demo](./assets/demo.png)

## ✨ Features

- 🎬 **Multi-modal input** — upload a video, image, or text and the system extracts content automatically
- 🤖 **AI persona simulation** — multiple personas analyze your content and react independently
- 📊 **Virality scoring** — each persona rates the content, averaged into an overall virality score
- 🕸️ **Spread graph** — interactive ReactFlow graph showing how content propagates across persona nodes
- 👤 **Persona detail panel** — click any node to see that persona's individual reaction and score

## ⚙️ How It Works

1. **Upload content** — drop in a video, image, or text clip
2. **Frame extraction** — backend extracts frames from video using `ffmpeg`
3. **Vision analysis** — Cloudflare Workers AI analyzes the frames for visual and audio context
4. **Persona generation** — a set of AI personas are created, each with unique traits and preferences
5. **Simulation** — each persona independently reacts to the content and assigns a score
6. **Scoring** — individual scores are averaged into a final virality score
7. **Spread graph** — results visualized as a ReactFlow graph with persona nodes and share edges

## 🔧 Tech Stack

![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![ReactFlow](https://img.shields.io/badge/ReactFlow-FF0072?style=flat-square&logo=react&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare_Workers_AI-F38020?style=flat-square&logo=cloudflare&logoColor=white)



> The dev server proxies `/api/*` to `http://localhost:8000` — run the backend first.

## 🗺️ Roadmap

- [ ] Ocean graph visualization
- [ ] Knowledge graph for persona generation
