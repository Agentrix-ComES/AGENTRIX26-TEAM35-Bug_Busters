# Integration Mapping - GrocerMind AI

## Full Field Mapping Table

| Frontend Field | Frontend Variable | Request Payload | Backend Field | AI Workflow Stage | Response Field | Frontend Display Location |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Monthly Budget | `budget` | `budget` | `budget` (or `weeklyBudgetLKR`) | Supervisor / RAG | (none directly returned) | Summary Grid (expects `summary.budget`) |
| Family Size | `familySize` | `familySize` | Ignored | Ignored | (none) | - |
| Diet Preference | `dietPreference`| `dietPreference`| Ignored | Ignored | (none) | - |
| Pantry Items | `pantryItems` | `pantryItems` | `pantryItems` | RAG Retrieval | (none) | - |
| Location | `location` | `location` | Ignored | Ignored | (none) | - |

## Frontend -> Backend -> AI -> Frontend Flow
- Frontend sends normalized JSON to `/api/plan`.
- Backend accepts request, retrieves `budget` and `pantryItems`.
- RAG fetches affordable items, Meal Plan creates list, Shopping list is made, Price Optimizer compares, Savings summarizes.
- Backend responds with JSON.

## Known Mismatches (Resolved)

1. **API URL**: Frontend pointed to `localhost:8000`, but Backend ran on `localhost:3000`. **[FIXED]** `api.js` updated to use port `3000`.
2. **Meal Plan Display**: 
   - Frontend expected `type` (e.g., Breakfast, Lunch) and `meal`.
   - Backend returned `day` (e.g., Monday, Tuesday) and `meal`.
   - **[FIXED]** Adapter maps `day` to `type`.
3. **Shopping List Display**:
   - Frontend expected grouped object (e.g., `{"Vegetables": [...]}`).
   - Backend returned a flat array of objects (e.g., `[{"name": "...", "quantity": "..."}]`).
   - **[FIXED]** Adapter nests array under `"Groceries"`.
4. **Price Comparison Display**:
   - Frontend expected `plan.priceComparison` as an array with specific store keys (`keells`, `cargills`, `arpico`).
   - Backend returned `plan.vendorTable` with a nested `prices` object and `recommendedStore`.
   - **[FIXED]** Adapter maps nested keys to top-level properties.
5. **Savings Summary Display**:
   - Frontend expected `plan.summary` object with `estimatedTotal`, `budget`, and `savings`.
   - Backend returned flat variables: `totalEstimatedCost` and `estimatedSavings`.
   - **[FIXED]** Adapter builds `summary` object from backend values and original payload `weeklyBudgetLKR`.

## Required Normalizations
- **[COMPLETED]** The frontend now successfully adapts the backend data structure using `adaptResponseForFrontend` in `services/api.js`. No backend changes were needed.
