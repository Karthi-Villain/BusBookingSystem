from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import chromadb
from chromadb.utils import embedding_functions
import ollama
import json
import hashlib
import time
import logging

app = Flask(__name__)
CORS(app)

# ---------------- LOGGING SETUP ----------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

# ---------------- CONFIG ----------------
DB_DIR = "./db"
COLLECTION_NAME = "bus_data"

# ---------------- LOAD DB ----------------
try:
    start = time.time()
    chroma_client = chromadb.PersistentClient(path=DB_DIR)
    emb_fn = embedding_functions.DefaultEmbeddingFunction()
    collection = chroma_client.get_collection(
        name=COLLECTION_NAME,
        embedding_function=emb_fn
    )
    logging.info(f"✅ Vector DB loaded in {time.time() - start:.3f}s")
except Exception as e:
    logging.warning("⚠️ DB not loaded. Run train.py")
    collection = None

# ---------------- CACHE ----------------
query_cache = {}

# ---------------- OPTIMIZED SYSTEM PROMPT ----------------
SYSTEM_PROMPT = """You are a strict bus booking assistant.

Rules:
1. Use ONLY the given CONTEXT.
2. If answer not found → "I don't have that information."
3. Detect intent:
   - Routes → return buses
   - Bus info → return buses
   - Routes, Bus Info → return "q_type":"busses"
   - Boarding/Dropping → return "q_type":"stops"
   - FAQ → message only
4. Always return valid JSON:

{
  "message": "string",
  "info": [
    {"name": "string", "type": "string", "departure": "string", "price": number, "busid": number, "from": "string", "to":"string"}// from , to optional if its bout Faq or q_type is stops
  ],
  "q_type": "string"
}
"""

# ---------------- QUERY TYPE DETECTOR ----------------
def detect_query_type(query):
    q = query.lower()

    if any(word in q for word in ["boarding", "dropping", "pickup", "stop"]):
        return "stops"
    elif any(word in q for word in ["bus", "price", "ticket", "travel"]):
        return "bus_info"
    elif any(word in q for word in ["from", "to", "route"]):
        return "route"
    else:
        return "faq"

# ---------------- KEYWORD FALLBACK ----------------
def keyword_fallback(query):
    start = time.time()
    results = collection.get(include=['documents'])

    matches = []
    words = [w for w in query.lower().split() if len(w) > 4]

    for doc in results['documents']:
        if any(word in doc.lower() for word in words):
            matches.append(doc)

    logging.info(f"🔁 Keyword fallback took {time.time() - start:.3f}s")
    return matches[:3]

# ---------------- ROUTES ----------------
@app.route("/bot", methods=["GET"])
def chat_interface():
    return render_template("chat.html")

@app.route('/chat', methods=['POST'])
def chat():
    total_start = time.time()

    if collection is None:
        return jsonify({"error": "Database not initialized"}), 500

    user_query = request.json.get("query", "")
    if not user_query:
        return jsonify({"error": "Query required"}), 400

    logging.info(f"📩 Query: {user_query}")

    # -------- QUERY TYPE --------
    query_type = detect_query_type(user_query)
    logging.info(f"📌 Query type: {query_type}")

    # -------- CACHE --------
    cache_start = time.time()
    query_hash = hashlib.md5(user_query.lower().encode()).hexdigest()

    if query_hash in query_cache:
        logging.info(f"⚡ Cache hit ({time.time() - cache_start:.3f}s)")
        return jsonify(query_cache[query_hash])

    logging.info(f"🧠 Cache miss ({time.time() - cache_start:.3f}s)")

    # -------- VECTOR SEARCH --------
    retrieval_start = time.time()

    results = collection.query(
        query_texts=[user_query],
        n_results=3,
        include=["documents", "distances"]
    )

    context_docs = results['documents'][0]
    distances = results['distances'][0]

    logging.info(f"🔎 Vector retrieval took {time.time() - retrieval_start:.3f}s")

    # -------- FALLBACK --------
    if not context_docs or (distances and distances[0] > 1.5):
        logging.warning("⚠️ Poor match → fallback triggered")
        context_docs = keyword_fallback(user_query)

    context_string = "\n".join(context_docs) if context_docs else "No context found"

    # -------- PROMPT BUILD --------
    prompt_start = time.time()
    prompt = f"[CONTEXT]\n{context_string}\n\n[QUERY]\n{user_query}"
    logging.info(f"🧾 Prompt built in {time.time() - prompt_start:.3f}s")

    # -------- LLM CALL --------
    llm_start = time.time()
    try:
        response = ollama.chat(
            model='llama3',
            messages=[
                {'role': 'system', 'content': SYSTEM_PROMPT},
                {'role': 'user', 'content': prompt}
            ],
            format='json',
            options={'temperature': 0.1}
        )

        logging.info(f"🤖 LLM response in {time.time() - llm_start:.3f}s")

        llm_output = response['message']['content']
        parsed_response = json.loads(llm_output)

        # -------- CACHE STORE --------
        query_cache[query_hash] = parsed_response

        total_time = time.time() - total_start
        logging.info(f"✅ Total time: {total_time:.3f}s")

        return jsonify(parsed_response)

    except json.JSONDecodeError:
        logging.error("❌ JSON parsing failed")
        return jsonify({"error": "Invalid JSON", "raw": llm_output}), 500

    except Exception as e:
        logging.error(f"❌ Error: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)