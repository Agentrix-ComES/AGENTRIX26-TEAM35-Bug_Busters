function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function familyQuantity(size, familySize) {
  if (String(size).toLowerCase().startsWith("per ")) {
    return `${Math.max(familySize, 1)} serving portions`;
  }

  return `${Math.max(familySize, 1)} x ${size}`;
}

function createShoppingList(mealPlan = [], userInput = {}) {
  const familySize = Math.max(Number(userInput.familySize) || 1, 1);
  const shoppingListMap = new Map();

  mealPlan.forEach((meal) => {
    (meal.ingredients || []).forEach((ingredient) => {
      const key = normalizeText(ingredient.name);
      const current = shoppingListMap.get(key);

      if (!current) {
        shoppingListMap.set(key, {
          name: ingredient.name,
          quantity: familyQuantity(ingredient.size, familySize),
          category: ingredient.category,
          usedIn: [meal.day],
        });
        return;
      }

      current.usedIn.push(meal.day);
    });
  });

  return [...shoppingListMap.values()];
}

module.exports = { createShoppingList };
