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

| Field Name | Type | Description | Required | Example |
| :--- | :--- | :--- | :---: | :--- |
| `familySize` | Number | Number of family members. | Yes | `4` |
| `budget` | Number | Target weekly grocery budget in LKR. | Yes | `5000` |
| `dietaryPreference` | String | Dietary restriction (e.g., vegetarian, non-veg). | No | `"vegetarian"` |
| `pantryItems` | Array (String) | List of items already at home (to exclude from shopping). | No | `["salt", "water"]` |
| `location` | String | User location for regional availability (Colombo, etc). | No | `"Colombo"` |

#### Example Request Body
```json
{
  "familySize": 4,
  "budget": 5000,
  "dietaryPreference": "vegetarian",
  "pantryItems": [
    "Garlic",
    "Cooking Oil"
  ],
  "location": "Colombo"
}
```

---

### Response Payload (JSON)

Returns the sequence of agents executed, a summary of RAG data retrieved, the final meal plan, the compiled shopping list, a store price breakdown, and calculations for total cost and savings.

#### Field Descriptions

- **`workflow`** *(Array of Strings)*: Chronological trace of agents invoked to process the request.
- **`priceContext`** *(Object)*: Summary of retrieved RAG dataset elements.
  - `source` *(String)*: Name of the pricing database.
  - `itemCount` *(Number)*: Total items cataloged in the RAG dataset.
  - `affordableItemCount` *(Number)*: Items fitting the user's budget constraint.
  - `sampleAffordableItems` *(Array)*: Preview list of matching cheap ingredients.
- **`mealPlan`** *(Array of Objects)*: Proposes meals per day.
  - `day` *(String)*: Day of the week.
  - `meal` *(String)*: Text description of the meal.
- **`shoppingList`** *(Array of Objects)*: Raw ingredients required.
  - `name` *(String)*: Name of the ingredient.
  - `quantity` *(String)*: Unit or weight size needed.
- **`vendorTable`** *(Array of Objects)*: Comparison details.
  - `item` *(String)*: Item name.
  - `quantity` *(String)*: Unit/weight.
  - `prices` *(Object)*: Map of prices indexed by store name (Keells, Cargills).
  - `recommendedStore` *(String)*: The cheapest store option.
  - `recommendedPrice` *(Number)*: The price at the recommended store.
  - `matched` *(Boolean)*: Whether pricing was found in the database.
- **`totalEstimatedCost`** *(Number)*: Combined optimized cost in LKR.
- **`estimatedSavings`** *(Number)*: Cost differential vs shopping entirely at the Keells baseline.
- **`notes`** *(Array of Strings)*: Agent-generated commentary or caveats.

#### Example Response Body
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
    "itemCount": 217,
    "affordableItemCount": 15,
    "sampleAffordableItems": [
      {
        "name": "Big Onion",
        "category": "Vegetable",
        "size": "500 g",
        "bestStore": "Cargills",
        "bestPrice": 165,
        "storePrices": {
          "Cargills": 165,
          "Keells": 180
        }
      }
    ]
  },
  "mealPlan": [
    {
      "day": "Monday",
      "meal": "Carrot curry with Seven Star Chakki Atta Flour"
    },
    {
      "day": "Tuesday",
      "meal": "My Choice Maldive Fish Chips with Potatoes"
    }
  ],
  "shoppingList": [
    {
      "name": "Seven Star Chakki Atta Flour",
      "quantity": "1 kg"
    },
    {
      "name": "Carrot",
      "quantity": "500 g"
    },
    {
      "name": "Potatoes",
      "quantity": "500 g"
    },
    {
      "name": "My Choice Maldive Fish Chips",
      "quantity": "100 g"
    }
  ],
  "vendorTable": [
    {
      "item": "Seven Star Chakki Atta Flour",
      "quantity": "1 kg",
      "prices": {
        "Cargills": 325,
        "Keells": 340
      },
      "recommendedStore": "Cargills",
      "recommendedPrice": 325,
      "matched": true
    },
    {
      "item": "Carrot",
      "quantity": "500 g",
      "prices": {
        "Cargills": 280,
        "Keells": 300
      },
      "recommendedStore": "Cargills",
      "recommendedPrice": 280,
      "matched": true
    },
    {
      "item": "Potatoes",
      "quantity": "500 g",
      "prices": {
        "Cargills": 185,
        "Keells": 195
      },
      "recommendedStore": "Cargills",
      "recommendedPrice": 185,
      "matched": true
    },
    {
      "item": "My Choice Maldive Fish Chips",
      "quantity": "100 g",
      "prices": {
        "Cargills": 460,
        "Keells": 480
      },
      "recommendedStore": "Cargills",
      "recommendedPrice": 460,
      "matched": true
    }
  ],
  "totalEstimatedCost": 1250,
  "estimatedSavings": 85,
  "notes": [
    "Meal plan generated only from affordable in-stock ingredients in the dummy price dataset."
  ]
}
```
