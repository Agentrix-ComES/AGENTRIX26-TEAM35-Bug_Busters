# 🛒 GrocerMind AI

**Team:** Bug Busters (Team 35)  
**Event:** Agentrix '26 Hackathon  

GrocerMind AI is an intelligent, multi-agent orchestration platform designed to fight food inflation. It dynamically plans budget-aware meals, intelligently compiles unified shopping lists, and optimizes grocery prices across local vendors (e.g., Keells vs. Cargills) to maximize your savings.

---

## ✨ Key Features

- 🧠 **Multi-Agent Orchestration**: Powered by a unified supervisor agent that coordinates a 5-step specialized pipeline:
  1. **RAG Retrieval Agent**: Ingests grocery datasets and filters items by real-time budget viability.
  2. **Meal Planning Agent**: Curates multi-day meal plans based strictly on affordable ingredients and dietary restrictions.
  3. **Shopping List Agent**: Consolidates ingredients, handles quantity mapping, and removes existing pantry items.
  4. **Price Optimization Agent**: Compares identical basket items across multiple vendors to find the cheapest route.
  5. **Savings Summary Agent**: Calculates final checkout price vs. baseline, predicting exact household savings.
- 🔐 **Secure SMTP Email Authentication**: Passwordless OTP generation using Nodemailer for seamless and secure user login.
- 👤 **Persistent Personalization Engine**: Robust profile memory that tracks budget ranges, allergies, disliked ingredients, cooking skill levels, and favorite cuisines for hyper-personalized AI generations.
- ⚡ **Lightning Fast UI**: Built on React + Vite, delivering an app-like seamless experience with reactive real-time API integrations.

## 🛠️ Tech Stack

**Frontend**
- React 18
- Vite
- React Router DOM
- Custom Vanilla CSS (University-themed UI constraints)

**Backend & AI Pipeline**
- Node.js & Express.js
- Custom Multi-Agent AI architecture (RAG, Task Delegation)
- Nodemailer (SMTP Authentication Engine)
- File-based JSON Memory Storage for high-speed state retention

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- An active SMTP Email Account (Gmail + App Password)
- Groq API Key (Optional, for LLM fallbacks if integrated)

### Installation Guide

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Agentrix-ComES/AGENTRIX26-TEAM35-Bug_Busters.git
   cd hackathon
   ```

2. **Install global dependencies:**
   The root repository uses `concurrently` to spin up both the front and backend automatically.
   ```bash
   npm install
   ```
   *Make sure you also run `npm install` inside the `frontend` and `backend` folders if needed.*

3. **Configure Environment Variables:**
   Navigate into the `backend/` directory, copy `.env.example` to `.env`, and populate your SMTP credentials:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=your_email@gmail.com
   SMTP_APP_PASSWORD=your_app_password
   SMTP_FROM="GrocerMind AI <your_email@gmail.com>"
   AUTH_CODE_SECRET=your_jwt_secret
   ```

4. **Launch the Application:**
   Run the dev application natively from the root directory:
   ```bash
   npm run dev
   ```
   - **Frontend** runs on: `http://localhost:5178`
   - **Backend API** runs on: `http://localhost:8000`

---

## 🎯 How it Works

1. **Onboarding**: Users authenticate via email OTP and complete a dynamic profile survey mapping their household size, budget limits, dietary preferences, and pantry inventory.
2. **Execution Phase**: The Supervisor Orchestrator intercepts the request, routes the constraints through the RAG context, formulates valid recipes, and deduplicates identical ingredients across the generated recipes.
3. **Resolution**: The system outputs a visually optimized React Dashboard offering day-by-day recipes alongside a Keells vs. Cargills checkout table.

---
*Built with ❤️ by Bug Busters for Agentrix '26.*
