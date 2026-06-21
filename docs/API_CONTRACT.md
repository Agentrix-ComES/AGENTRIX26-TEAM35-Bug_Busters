# API Contract - GrocerMind AI

This document specifies the REST API contract for the GrocerMind AI backend server. The endpoint acts as the single interface connecting the frontend user inputs to the backend agent pipeline.

---

## Base Configuration

- **Protocol**: HTTP
- **Default Port**: `3000`
- **Base Path**: `/api`
- **Content-Type**: `application/json`

---

## Endpoint: Generate Meal & Shopping Plan

Generate a budget-optimized meal plan, shopping list, store price comparison, and estimated savings.

- **Route**: `POST /api/plan`
- **Auth Required**: None (stateless session for MVP)

### Request Payload (JSON)

| Field Name | Type | Description | Required by Backend | Supported / Used by Backend | Example |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `budget` | Number | Target weekly grocery budget in LKR. | Yes (Partial) | **Yes** | `12000` |
| `pantryItems` | Array (String) | List of items already at home (to exclude from shopping). Defaults to `[]`. | No | **Yes** | `["rice", "dhal"]` |
| `familySize` | Number | Number of family members. | No | **Yes (Pro)** | `4` |
| `dietaryPreference` | String | Dietary restriction (e.g., vegetarian, balanced). | No | **No (Ignored)** | `"balanced"` |
| `location` | String | User location for regional availability. | No | **No (Ignored)** | `"Galle"` |
| `receiptText` | String | Plain text receipt to extract pantry items from. | No | **Yes (Pro)** | `"Dhal 1kg\nEggs"` |

> [!WARNING]
> The backend destructures **only** `budget` and `pantryItems` from the request body. Other fields like `familySize`, `dietaryPreference` (or `dietPreference`), and `location` are completely ignored by the current implementation. If the frontend sends budget under a different name (e.g. `weeklyBudgetLKR`), the backend will not recognize it, and will bypass budget filtering.

#### Recommended Frontend Mapping (Normalizer)
If the frontend UI collects the fields from the hackathon's standard form, it **must** map them to the backend keys as follows before dispatching the request:
```javascript
const payload = {
  budget: frontendInputs.weeklyBudgetLKR, // CRITICAL: Map weeklyBudgetLKR to budget
  pantryItems: frontendInputs.pantryItems || [],
  
  // These fields can be included but are ignored by the backend:
  familySize: frontendInputs.familySize, 
  dietaryPreference: frontendInputs.dietPreference,
  location: frontendInputs.location
};
```

> [!WARNING]
> **Integration Mismatches Detected:**
> 1. **Port Mismatch:** Frontend `services/api.js` points to `http://localhost:8000/api/plan`, but backend runs on `3000`.
> 2. **Response Structure Mismatches:**
>    - `mealPlan`: Frontend expects `type` (Breakfast/Lunch/Dinner), but backend provides `day` (Monday/Tuesday).
>    - `shoppingList`: Frontend expects a categorized object (e.g., `{"Vegetables": [...]}`), but backend provides a flat array `[...]`.
>    - `priceComparison`: Frontend expects `plan.priceComparison` with `keells`, `cargills`, `arpico` keys. Backend provides `plan.vendorTable` with a nested `prices` object and `recommendedStore`.
>    - `summary`: Frontend expects `plan.summary.estimatedTotal`/`savings`. Backend provides `plan.totalEstimatedCost` and `plan.estimatedSavings`.
> These mismatches must be resolved before the integration is considered complete.

#### Example Request Body (Normalized)
```json
{
  "budget": 12000,
  "pantryItems": [
    "rice",
    "dhal"
  ],
  "familySize": 4,
  "dietaryPreference": "balanced",
  "location": "Galle"
}
```

---

### Response Payload (JSON)

Returns the sequence of agents executed, a summary of RAG data retrieved, the final meal plan, the compiled shopping list, a store price breakdown, and calculations for total cost and savings.

#### Field Descriptions

- **`workflow`** *(Array of Strings)*: Chronological trace of agents invoked to process the request.
- **`priceContext`** *(Object)*: Summary of retrieved RAG dataset elements.
  - `source` *(String)*: Name of the pricing database (`"dummy-grocery-price-dataset"`).
  - `itemCount` *(Number)*: Total items cataloged in the RAG dataset.
  - `affordableItemCount` *(Number)*: Items fitting the user's budget constraint (price <= `budget * 0.25` or `250 LKR` minimum).
  - `sampleAffordableItems` *(Array of Objects)*: Preview list of up to 8 cheapest matching ingredients:
    - `name` *(String)*: Name of the item.
    - `category` *(String)*: Category of the item.
    - `size` *(String)*: Pack size/unit.
    - `bestStore` *(String)*: Cheapest vendor.
    - `bestPrice` *(Number)*: Price at the cheapest vendor.
    - `storePrices` *(Object)*: Map of all prices indexed by store name.
- **`mealPlan`** *(Array of Objects)*: Proposes meals per day (fixed to Monday/Tuesday for MVP).
  - `day` *(String)*: Day of the week.
  - `meal` *(String)*: Text description of the meal.
- **`shoppingList`** *(Array of Objects)*: Raw ingredients required for the meal plan.
  - `name` *(String)*: Name of the ingredient.
  - `quantity` *(String)*: Unit or weight size needed.
- **`vendorTable`** *(Array of Objects)*: Comparison details for each shopping list item.
  - `item` *(String)*: Item name.
  - `quantity` *(String)*: Unit/weight.
  - `prices` *(Object)*: Map of prices indexed by store name (e.g. `{"Cargills": 325, "Keells": 340}`).
  - `recommendedStore` *(String)*: The cheapest store option.
  - `recommendedPrice` *(Number)*: The price at the recommended store.
  - `matched` *(Boolean)*: Whether pricing was found in the database.
- **`totalEstimatedCost`** *(Number)*: Combined optimized cost in LKR.
- **`estimatedSavings`** *(Number)*: Cost differential vs shopping entirely at the Keells baseline (defined as `Keells price || recommendedPrice`).
- **`notes`** *(Array of Strings)*: Agent-generated commentary or warnings.

**GrocerMind Pro Demo Features (Additive Post-MVP):**
- **`receiptExtraction`** *(Object)*: Text-based parsing of receipt string into pantry items (Note: OCR/Image parsing is not implemented).
- **`pantryImpact`** *(Object)*: Analytics on how pantry and receipt items reduced purchases.
- **`householdScaling`** *(Object)*: Information on quantity estimations based on `familySize`.
- **`storeBasketStrategy`** *(Array)*: Grouping of shopping list items by recommended vendor for easier fulfillment.
- **`savingsExplanation`** *(Object)*: Natural language rationale for the optimization engine.
- **`budgetHealth`** *(Object)*: Budget evaluation score (`within_budget`, `near_limit`, or `over_budget`).
- **`finalRecommendation`** *(Object)*: Executive summary with next best action for the user.

#### Example Response Body (Actual Golden Response)
```json
{
  "workflow": [
    "Supervisor Agent",
    "RAG Retrieval Agent",
    "Meal Planning Agent",
    "Shopping List Agent",
    "Price Optimization Agent",
    "Savings Summary Agent"
  ],
  "priceContext": {
    "source": "dummy-grocery-price-dataset",
    "itemCount": 108,
    "affordableItemCount": 95,
    "sampleAffordableItems": [
      {
        "name": "Pumpkin",
        "category": "Grocery",
        "size": "500 g",
        "bestStore": "Cargills",
        "bestPrice": 50,
        "storePrices": {
          "Cargills": 50
        }
      },
      {
        "name": "Cabbage",
        "category": "Vegetable",
        "size": "500 g",
        "bestStore": "Cargills",
        "bestPrice": 70,
        "storePrices": {
          "Cargills": 70,
          "Keells": 136
        }
      },
      {
        "name": "MAGGI Chicken Flavored Seasoning Cubes",
        "category": "Seasoning / Mix",
        "size": "16 g",
        "bestStore": "Cargills",
        "bestPrice": 72,
        "storePrices": {
          "Cargills": 72
        }
      },
      {
        "name": "Green Chillies",
        "category": "Grocery",
        "size": "100 g",
        "bestStore": "Cargills",
        "bestPrice": 88,
        "storePrices": {
          "Cargills": 88
        }
      },
      {
        "name": "Brinjal",
        "category": "Grocery",
        "size": "350 g",
        "bestStore": "Cargills",
        "bestPrice": 126,
        "storePrices": {
          "Cargills": 126
        }
      },
      {
        "name": "Red Onion",
        "category": "Vegetable",
        "size": "250 g",
        "bestStore": "Cargills",
        "bestPrice": 128,
        "storePrices": {
          "Cargills": 128
        }
      },
      {
        "name": "Leeks",
        "category": "Grocery",
        "size": "250 g",
        "bestStore": "Cargills",
        "bestPrice": 130,
        "storePrices": {
          "Cargills": 130
        }
      },
      {
        "name": "Coconut",
        "category": "Fruit / Ingredient",
        "size": "per unit",
        "bestStore": "Keells",
        "bestPrice": 139,
        "storePrices": {
          "Cargills": 414,
          "Keells": 139
        }
      }
    ]
  },
  "mealPlan": [
    {
      "day": "Monday",
      "meal": "Cabbage curry with Seven Star Chakki Atta Flour"
    },
    {
      "day": "Tuesday",
      "meal": "Chicken Neck with Red Onion"
    }
  ],
  "shoppingList": [
    {
      "name": "Seven Star Chakki Atta Flour",
      "quantity": "1 kg"
    },
    {
      "name": "Cabbage",
      "quantity": "500 g"
    },
    {
      "name": "Red Onion",
      "quantity": "250 g"
    },
    {
      "name": "Chicken Neck",
      "quantity": "per kg"
    }
  ],
  "vendorTable": [
    {
      "item": "Seven Star Chakki Atta Flour",
      "quantity": "1 kg",
      "prices": {
        "Cargills": 325
      },
      "recommendedStore": "Cargills",
      "recommendedPrice": 325,
      "matched": true
    },
    {
      "item": "Cabbage",
      "quantity": "500 g",
      "prices": {
        "Cargills": 70,
        "Keells": 136
      },
      "recommendedStore": "Cargills",
      "recommendedPrice": 70,
      "matched": true
    },
    {
      "item": "Red Onion",
      "quantity": "250 g",
      "prices": {
        "Cargills": 128
      },
      "recommendedStore": "Cargills",
      "recommendedPrice": 128,
      "matched": true
    },
    {
      "item": "Chicken Neck",
      "quantity": "per kg",
      "prices": {
        "Keells": 990
      },
      "recommendedStore": "Keells",
      "recommendedPrice": 990,
      "matched": true
    }
  ],
  "totalEstimatedCost": 1513,
  "estimatedSavings": 66,
  "notes": [
    "Meal plan generated only from affordable in-stock ingredients in the dummy price dataset."
  ]
}
```

---

## Error Handling and Constraints

### Unhandled Crash Risk
- **No Try-Catch Blocks**: There is no endpoint-level error wrapper.
- **Null Request Body**: If the request body is `null` or empty without standard headers, it could cause Node.js to throw a `TypeError` during parameter destructuring, resulting in an Express 500 error page with an HTML stack trace.
- **Fallback empty state**: If no affordable items match the budget, the endpoint does not throw an error but returns status `200` with empty plan arrays:
  ```json
  {
    "workflow": [...],
    "priceContext": { "source": "...", "itemCount": 108, "affordableItemCount": 0, "sampleAffordableItems": [] },
    "mealPlan": [],
    "shoppingList": [],
    "vendorTable": [],
    "totalEstimatedCost": 0,
    "estimatedSavings": 0,
    "notes": [
      "No affordable in-stock ingredients were found in the dummy price dataset."
    ]
  }
  ```
