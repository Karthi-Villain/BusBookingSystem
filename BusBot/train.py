import json
import argparse
import chromadb
from chromadb.utils import embedding_functions
import os
import shutil

DB_DIR = "./db"
COLLECTION_NAME = "bus_data"

def process_data(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        raw_data = json.load(f)

    documents, metadatas, ids = [], [], []

    for i, item in enumerate(raw_data):
        if "from" in item and "to" in item:
            route = f"{item['from']} to {item['to']}"
            
            for j, bus in enumerate(item.get('buses', [])):
                doc = f"Bus ID: {bus["busId"]}. Route: {route}. Operator: {bus['name']}, Type: {bus['type']}, Departure: {bus['departure']}, Price: INR {bus['price']}. From: {item["from"]}. To: {item["to"]}."
                documents.append(doc)
                metadatas.append({"type": "route", "from": item["from"], "to": item["to"], "operator": bus["name"]})
                ids.append(f"route_{i}_bus_{j}")

            for j, bp in enumerate(item.get('boarding_points', [])):
                doc = f"Boarding point for route {route} in {item['from']}: {bp['name']} at {bp['address']}."
                documents.append(doc)
                metadatas.append({"type": "boarding_point"})
                ids.append(f"route_{i}_bp_{j}")

            for j, dp in enumerate(item.get('dropping_points', [])):
                doc = f"Dropping point for route {route} in {item['to']}: {dp['name']} at {dp['address']}."
                documents.append(doc)
                metadatas.append({"type": "dropping_point"})
                ids.append(f"route_{i}_dp_{j}")
                
        elif "faqs" in item:
            for j, faq in enumerate(item["faqs"]):
                doc = f"FAQ - Question: {faq['faq']} Answer: {faq['answer']}"
                
                documents.append(doc)
                metadatas.append({"type": "faq"})
                ids.append(f"faq_{i}_{j}")

    return documents, metadatas, ids

def train(data_path, mode="overwrite"):
    if mode == "overwrite" and os.path.exists(DB_DIR):
        shutil.rmtree(DB_DIR)

    # Initialize ChromaDB connected to disk
    client = chromadb.PersistentClient(path=DB_DIR)
    emb_fn = embedding_functions.DefaultEmbeddingFunction()

    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=emb_fn
    )

    docs, metas, ids = process_data(data_path)

    # Upsert automatically handles adding new or updating existing IDs
    collection.upsert(documents=docs, metadatas=metas, ids=ids)
    print(f"✅ Successfully embedded and saved {len(docs)} chunks to {DB_DIR} (Mode: {mode}).")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", default="./data/data.json", help="Path to JSON data file")
    parser.add_argument("--mode", choices=["append", "overwrite"], default="overwrite", help="Training mode")
    args = parser.parse_args()
    
    train(args.data, args.mode)