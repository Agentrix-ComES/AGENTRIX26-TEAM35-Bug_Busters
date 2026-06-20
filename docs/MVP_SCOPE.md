# MVP Scope - GrocerMind AI

This document defines the Minimum Viable Product (MVP) scope for GrocerMind AI, a student hackathon project built within a 12-hour timeframe. It details the core features that are implemented for the demo and clarifies what has been postponed for future development.

---

## Core MVP Features

To deliver a working and stable prototype, the MVP focuses strictly on the following four core features:

### 1. Price-Aware Meal Planning
- **Goal**: Generate a 2-day meal plan tailored to the user's budget and family size.
- **Data Source**: Uses a mock vector-style dataset parsed from local files (`chroma_ready.json`).
- **How it works**:
  - Filters out ingredients the user already has in their pantry.
  - Matches the user's budget constraint (prioritizing affordable, in-stock ingredients).
  - Recommends simple, realistic Sri Lankan meals (e.g., vegetable curry with flour-based staples).

### 2. Shopping List Generation
- **Goal**: Automatically extract the exact ingredients and standard pack sizes/quantities needed to prepare the generated meal plan.
- **Details**: Translates the meals into structured items (e.g., "Carrot", "Potatoes", "Seven Star Chakki Atta Flour") with their respective quantities (e.g., "500 g", "1 kg").

### 3. Dummy Grocery Price Comparison
- **Goal**: Compare grocery prices for the shopping list items across mock local supermarkets.
- **Supermarkets**: Cargills and Keells.
- **Price Resolution**: Matches each list item against the dummy price dataset, looking up the price for both stores, and highlighting which vendor is cheaper.

### 4. Savings Summary
- **Goal**: Summarize the economic value of using GrocerMind AI.
- **Calculations**:
  - Computes the total cost of the shopping list using the cheapest recommended vendor for each item.
  - Establishes a baseline cost (e.g., shopping entirely at Keells).
  - Shows the final estimated cost and the calculated savings (Baseline Cost - Optimized Cost).

---

## Out of Scope for MVP (Hackathon Boundaries)

To ensure stability and completeness under the 12-hour constraint, the following features are explicitly **out of scope** for the MVP but recorded for future phases:

- **Real-Time Web Scraping**: Live scraping of supermarket websites (Keells, Cargills, Glomark, Arpico) is replaced by the local static mock dataset (`chroma_ready.json`).
- **User Accounts & Auth**: No signup, login, or persistent user profiles. The system is session-based and stateless.
- **Persistent Database**: No Postgres, MongoDB, or external vector DB integration. Data is read directly from memory/JSON files.
- **Receipt OCR**: Automatic pantry inventory updates via receipt photo uploads are excluded. Users manually input their pantry list as text arrays.
- **Route Optimization**: Multi-stop shop routing on maps is excluded. The system recommends the cheapest vendor per-item or per-basket but does not map physical routes.
- **Pantry Expiry Tracking**: Active tracking of expiry dates or waste alerts is excluded.
- **Payment Gateway / Ordering**: Integration with checkout/delivery APIs of supermarket chains is excluded.
