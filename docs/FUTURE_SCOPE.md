# Future Scope - GrocerMind AI

This document outlines the long-term vision and feature roadmap for GrocerMind AI. These features expand the 12-hour hackathon MVP into a production-grade, enterprise-scale grocery planning and cost-saving ecosystem.

---

## Roadmap Overview

```
Phase 1: Real-Time Data & Storage ──> Phase 2: User Experience & OCR ──> Phase 3: Advanced Optimization & Multi-Agents
```

---

## Core Enhancement Areas

### 1. Real-Time Supermarket Price Scraping
- **MVP State**: Uses static mock data (`chroma_ready.json`).
- **Production Vision**: 
  - Build scheduled cron jobs and on-demand web scrapers using **Puppeteer** or **Playwright** to fetch live pricing, stock levels, and promotional discounts from major Sri Lankan supermarket chains (Keells, Cargills Food City, SPAR, Glomark, Arpico Supercentre).
  - Implement a caching layer (Redis) to prevent IP blocking and reduce API latencies.

### 2. Production RAG Knowledge Base
- **MVP State**: Mock array matching of item names.
- **Production Vision**:
  - Integrate a true Vector Database (e.g., **ChromaDB**, **Pinecone**, or **PGVector**).
  - Use text embeddings (e.g., OpenAI `text-embedding-3-small` or Cohere) to encode complex local recipe directories and pricing structures.
  - Implement semantic search so users can input ambiguous queries (e.g., *"traditional hot Sri Lankan lunch"*), which translates semantically to ingredients like red rice, dhal, and green chillies.

### 3. Receipt OCR for Automatic Pantry Updates
- **MVP State**: Manual textual input of pantry items.
- **Production Vision**:
  - Allow users to upload photos of grocery receipts.
  - Utilize Optical Character Recognition (OCR) engines (e.g., **Tesseract**, **Google Cloud Vision API**, or **AWS Textract**) to extract item names, quantities, and purchase dates.
  - Automatically parse scanned receipts to populate and update the user's pantry inventory.

### 4. Route Optimization (Green Shopping Trips)
- **MVP State**: Recommends cheapest vendors per-item or per-basket without physical location awareness.
- **Production Vision**:
  - Incorporate the **Google Maps Distance Matrix API** or **Mapbox API**.
  - Resolve the Travelling Salesperson Problem (TSP) for users who want to visit multiple stores (e.g., buying vegetables at Cargills but flour at Keells).
  - Calculate if the fuel/travel cost of visiting a second store outweighs the savings of buying the item at a single store, recommending the most cost-effective and carbon-friendly route.

### 5. Food Waste Reduction & Expiry Tracking
- **MVP State**: Stateless session filtering.
- **Production Vision**:
  - Add expiry tracking to pantry items.
  - Send push notifications when items (like milk or meat) are nearing their expiry date.
  - Prioritize soon-to-expire items in the Meal Planning Agent's prompt to generate recipes that consume them first.

### 6. User Accounts & Persistent Storage
- **MVP State**: Stateless single-request processing.
- **Production Vision**:
  - Add secure login and authentication using **Firebase Auth**, **Auth0**, or **Supabase**.
  - Implement a relational database (e.g., **PostgreSQL**) to store user profiles, dietary restrictions, pantry inventories, historical meal plans, and aggregate savings statistics.

### 7. Advanced Multi-Agent Orchestration
- **MVP State**: Synchronous function-based execution within a single Node.js script.
- **Production Vision**:
  - Migrate the pipeline to an asynchronous multi-agent framework such as **LangGraph**, **CrewAI**, or **AutoGen**.
  - Separate agents into independent microservices communicating via message brokers (e.g., RabbitMQ, Kafka) or gRPC.
  - Enable advanced conversation loops where agents can negotiate, reflect, and self-correct (e.g., the Meal Planning Agent negotiating with the Price Optimizer to swap an ingredient to fit a tight budget).
