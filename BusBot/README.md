<div align="center">

# 🤖 BusBooking AI Chatbot

[![Flask](https://img.shields.io/badge/Flask-3.x-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Ollama](https://img.shields.io/badge/Ollama-LLaMA_3-FF6F00?style=for-the-badge&logo=meta&logoColor=white)](https://ollama.com/)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-0.4+-4A90D9?style=for-the-badge)](https://www.trychroma.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)

**An AI-powered conversational assistant for the BusBooking platform, built with RAG (Retrieval-Augmented Generation) using LLaMA 3 and ChromaDB.**

[How It Works](#-how-it-works) · [Setup](#-setup) · [API](#-api-reference) · [Data Format](#-data-format) · [Performance](#-performance)

---

</div>

## ✨ Overview

The chatbot provides instant, accurate responses about bus routes, pricing, schedules, boarding/dropping points, and FAQs — all powered by a local LLM running through Ollama, with no external API costs.

### Key Capabilities

| Feature | Description |
|---------|-------------|
| 🗺️ **Route Search** | Find buses between any two cities |
| 💰 **Price Lookup** | Get ticket prices for specific buses |
| 📍 **Stop Info** | View boarding & dropping points for routes |
| ❓ **FAQ Answers** | Luggage, cancellation, safety, refunds & more |
| ⚡ **Query Caching** | MD5-based caching for instant repeat responses |
| 🔁 **Smart Fallback** | Keyword-based fallback when vector search scores low |

---

## 🧠 How It Works

### RAG Pipeline

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  User Query  │────▶│  Intent Detection │────▶│  Vector Search   │
└─────────────┘     └──────────────────┘     │  (ChromaDB)      │
                                              └────────┬────────┘
                                                       │
                                              ┌────────▼────────┐
                                              │  Relevance Check │
                                              │  distance > 1.5? │
                                              └──┬──────────┬───┘
                                            Yes  │          │  No
                                    ┌─────────▼──┐    ┌───▼──────────┐
                                    │  Keyword    │    │  Top 3 Docs   │
                                    │  Fallback   │    │  as Context   │
                                    └─────────┬──┘    └───┬──────────┘
                                              │          │
                                              └─────┬────┘
                                              ┌─────▼────────────┐
                                              │  LLaMA 3 (Ollama) │
                                              │  + System Prompt   │
                                              └─────┬────────────┘
                                              ┌─────▼────────────┐
                                              │  Structured JSON   │
                                              │  Response          │
                                              └──────────────────┘
```

### Processing Steps

1. **Query Type Detection** — Rule-based classifier categorizes user intent:
   - `route` — Contains words like "from", "to", "route"
   - `bus_info` — Contains "bus", "price", "ticket", "travel"
   - `stops` — Contains "boarding", "dropping", "pickup", "stop"
   - `faq` — Everything else

2. **Cache Check** — MD5 hash of the lowercased query is checked against in-memory cache

3. **Vector Retrieval** — ChromaDB performs semantic similarity search, returning top 3 matching documents

4. **Fallback Logic** — If the best match distance > 1.5, switches to keyword-based document matching

5. **LLM Generation** — LLaMA 3 receives a structured prompt with retrieved context and generates a JSON response

6. **Cache Store** — Successful responses are cached for future identical queries

---

## 🚀 Setup

### Prerequisites

| Requirement | Version |
|------------|---------|
| Python | ≥ 3.10 |
| Ollama | Latest |
| LLaMA 3 model | Via Ollama |

### Installation

```bash
# 1. Navigate to chatbot directory
cd BusBot

# 2. Install Python dependencies
pip install flask flask-cors chromadb ollama

# 3. Pull the LLaMA 3 model (one-time, ~4.7GB)
ollama pull llama3

# 4. Prepare your data
# Edit data.json with your bus routes, stops, and FAQs

# 5. Build the vector database
python train.py
# ✅ This creates the ./db directory with ChromaDB embeddings

# 6. Start the chatbot server
python app.py
# 🚀 Running on http://localhost:5001
```

### Verify Installation

```bash
# Test the chat endpoint
curl -X POST http://localhost:5001/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "Buses from Hyderabad to Bangalore"}'

# Open the chat UI
open http://localhost:5001/bot
```

---

## 📡 API Reference

### `POST /chat`

Send a natural language query and receive a structured JSON response.

**Request:**

```json
{
  "query": "What buses go from Hyderabad to Bangalore?"
}
```

**Response:**

```json
{
  "message": "Here are the available buses from Hyderabad to Bangalore:",
  "info": [
    {
      "name": "VRL Travels",
      "type": "Sleeper",
      "departure": "22:00",
      "price": 1200,
      "busid": 1,
      "from": "Hyderabad",
      "to": "Bangalore"
    },
    {
      "name": "Orange Tours",
      "type": "AC Semi-Sleeper",
      "departure": "21:30",
      "price": 900,
      "busid": 2,
      "from": "Hyderabad",
      "to": "Bangalore"
    }
  ],
  "q_type": "busses"
}
```

### `GET /bot`

Serves the chat web interface (`templates/chat.html`).

### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `message` | `string` | Human-readable response text |
| `info` | `array` | List of bus objects (empty for FAQ responses) |
| `info[].name` | `string` | Bus operator name |
| `info[].type` | `string` | Bus type (Sleeper, AC Semi-Sleeper, etc.) |
| `info[].departure` | `string` | Departure time (HH:MM) |
| `info[].price` | `number` | Ticket price in INR |
| `info[].busid` | `number` | Bus identifier |
| `info[].from` | `string` | Origin city (optional for FAQ/stops) |
| `info[].to` | `string` | Destination city (optional for FAQ/stops) |
| `q_type` | `string` | Query classification: `busses`, `stops`, or `faq` |

### Error Responses

| Status | Body | Cause |
|--------|------|-------|
| `400` | `{"error": "Query required"}` | Empty query string |
| `500` | `{"error": "Database not initialized"}` | ChromaDB not loaded (run `train.py`) |
| `500` | `{"error": "Invalid JSON", "raw": "..."}` | LLM returned non-JSON output |

---

## 📦 Data Format

The chatbot is trained on `data.json`, which contains bus routes with associated information:

```json
[
  {
    "from": "Hyderabad",
    "to": "Bangalore",
    "buses": [
      {
        "name": "VRL Travels",
        "type": "Sleeper",
        "departure": "22:00",
        "price": 1200
      }
    ],
    "boarding_points": ["Miyapur", "KPHB", "Ameerpet", "LB Nagar"],
    "dropping_points": ["Majestic", "Electronic City", "Silk Board"],
    "faqs": [
      {
        "faq": "What is the luggage policy?",
        "answer": "Each passenger is allowed 15kg of checked luggage and 1 small cabin bag."
      }
    ]
  }
]
```

### Adding New Routes

1. Add a new route object to `data.json` with buses, stops, and FAQs
2. Re-run `python train.py` to rebuild the vector database
3. Restart the chatbot server

---

## ⚡ Performance

The chatbot includes detailed logging for every request:

```
📩 Query: buses from hyderabad to bangalore
📌 Query type: route
🧠 Cache miss (0.001s)
🔎 Vector retrieval took 0.042s
🧾 Prompt built in 0.000s
🤖 LLM response in 1.823s
✅ Total time: 1.870s
```

| Stage | Typical Time |
|-------|-------------|
| Intent Detection | < 1ms |
| Cache Lookup | < 1ms |
| Vector Search | 30-50ms |
| Keyword Fallback | 50-100ms |
| LLM Generation | 1-3s |
| **Total (cold)** | **~2s** |
| **Total (cached)** | **< 5ms** |

---

## 📂 File Structure

```
chatbot/
├── app.py                 # Flask server with RAG pipeline
├── train.py               # Script to build ChromaDB from data.json
├── data.json              # Bus routes, stops & FAQ data
├── templates/
│   └── chat.html          # Web-based chat interface
├── db/                    # ChromaDB persistent storage (auto-generated)
└── README.md              # ← You are here
```

---

## 🔧 Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_DIR` | `./db` | ChromaDB storage directory |
| `COLLECTION_NAME` | `bus_data` | ChromaDB collection name |
| Port | `5001` | Chatbot server port |
| LLM Model | `llama3` | Ollama model to use |
| Temperature | `0.1` | LLM creativity (low = more factual) |
| `n_results` | `3` | Number of documents retrieved per query |
| Fallback threshold | `1.5` | Max vector distance before keyword fallback |

---

## 🛣️ Roadmap

- [ ] Conversation history / multi-turn chat
- [ ] Streaming responses for better UX
- [ ] Multi-language support (Hindi, Telugu, Kannada)
- [ ] Admin panel to manage training data
- [ ] Integration with live seat availability

---

<div align="center">

**Part of the [BusBooking](../README.md) project** · Built with ❤️ using LLaMA 3 & ChromaDB

</div>
