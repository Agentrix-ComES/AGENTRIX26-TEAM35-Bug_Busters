# Frontend Overview - GrocerMind AI

## Framework
- React + Vite

## Main Files
- Entry: `frontend/main.jsx`, `frontend/App.jsx`
- Pages: `UserInput.jsx`, `MealPlan.jsx`, `ShoppingList.jsx`, `PriceComparison.jsx`
- Components: `EmptyState.jsx`, `ErrorState.jsx`, `LoadingState.jsx`, `Navbar.jsx`
- API Service: `services/api.js`

## Form Fields (UserInput.jsx)
- `familySize` (Select, mapped to Number)
- `budget` (Input, mapped to Number)
- `dietPreference` (Select, String)
- `pantryItems` (Input, split into Array of Strings)
- `location` (Input, String)

## Result Display Sections
- **Meal Plan**: Displays meal type and meal name.
- **Shopping List**: Categorizes items into sections (e.g., Vegetables, Meat & Fish, Pantry Essentials) with checkboxes.
- **Price Comparison & Savings**: Table showing item prices across Keells, Cargills, Arpico, and the best price. Summary grid shows Estimated Total, Budget, and Savings.

## Current Readiness Status
- **Build Status**: PASS
- **API Target**: Points to `http://localhost:8000/api/plan` instead of the backend's `http://localhost:3000/api/plan`. Needs update.
