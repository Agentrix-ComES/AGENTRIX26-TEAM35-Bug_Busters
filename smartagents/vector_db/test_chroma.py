import json
import chromadb
from sentence_transformers import SentenceTransformer

# Load model locally (NO INTERNET DEPENDENCY)
model = SentenceTransformer("all-MiniLM-L6-v2")

client = chromadb.PersistentClient(path="./vector_db")
collection = client.get_or_create_collection(name="products")

with open("chroma_ready.json", "r", encoding="utf-8") as f:
    rag_data = json.load(f)

texts = [item["text"] for item in rag_data]
ids = [item["id"] for item in rag_data]

embeddings = model.encode(texts).tolist()

collection.add(
    ids=ids,
    documents=texts,
    embeddings=embeddings
)

print("🚀 Indexed successfully with manual embeddings!")
print("Total docs:", collection.count())