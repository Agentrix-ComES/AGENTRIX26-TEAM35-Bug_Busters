# GrocerMind AI Architecture

GrocerMind AI uses a supervisor-based agentic pipeline where dummy grocery price data is retrieved first, then used to generate a price-aware meal plan, shopping list, optimized vendor selection, and savings summary.

## Frozen Workflow

Supervisor Agent -> RAG Retrieval Agent -> Meal Planning Agent -> Shopping List Agent -> Price Optimization Agent -> Savings Summary Agent

## High-Level System Architecture

```mermaid
flowchart TD
    U[User] --> FE[Frontend Web App]
    FE --> SA[Supervisor Agent / Backend]

    SA --> RAG[RAG Retrieval Agent]
    RAG --> DATA[Dummy Grocery Price Dataset]

    SA --> MP[Meal Planning Agent]
    MP --> SL[Shopping List Agent]
    SL --> PO[Price Optimization Agent]
    PO --> SS[Savings Summary Agent]

    SS --> FE
    FE --> U
```

## Agentic Workflow

```mermaid
flowchart TD
    A[User Input: family size, budget, pantry items] --> B[Supervisor Agent]
    B --> C[RAG Retrieval Agent gets price data]
    C --> D[Meal Planning Agent creates affordable meals]
    D --> E[Shopping List Agent extracts required groceries]
    E --> F[Price Optimization Agent selects cheapest vendors]
    F --> G[Savings Summary Agent calculates total and savings]
    G --> H[Final Grocery Plan]
```

## Execution Sequence

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Supervisor
    participant RAG
    participant MealAgent
    participant PriceAgent

    User->>Frontend: Enter budget, family size, pantry items
    Frontend->>Supervisor: Send request
    Supervisor->>RAG: Retrieve grocery prices
    RAG-->>Supervisor: Return dummy price data
    Supervisor->>MealAgent: Generate price-aware meal plan
    MealAgent-->>Supervisor: Meal plan + ingredients
    Supervisor->>PriceAgent: Optimize vendor choices
    PriceAgent-->>Supervisor: Cheapest list + savings
    Supervisor-->>Frontend: Final recommendation
    Frontend-->>User: Show meal plan, shopping list, savings
```
