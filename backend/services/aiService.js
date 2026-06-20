function byCategory(priceContext, category) {
  return priceContext.affordableItems.filter((item) => item.category === category);
}

function pick(items, fallbackItems, index = 0) {
  return items[index] || fallbackItems[index] || fallbackItems[0];
}

function generateMealPlan(input, priceContext) {
  const affordableItems = priceContext.affordableItems;
  const vegetables = byCategory(priceContext, "Vegetable");
  const proteins = [
    ...byCategory(priceContext, "Meat"),
    ...byCategory(priceContext, "Fish / Seafood"),
  ];
  const staples = [
    ...byCategory(priceContext, "Flour"),
    ...byCategory(priceContext, "Grocery"),
  ];
  const fallbackItems = affordableItems.slice(0, 6);

  if (fallbackItems.length === 0) {
    return {
      mealPlan: [],
      shoppingList: [],
      notes: [
        "No affordable in-stock ingredients were found in the dummy price dataset.",
      ],
    };
  }

  const staple = pick(staples, fallbackItems, 0);
  const vegetable = pick(vegetables, fallbackItems, 0);
  const secondVegetable = pick(vegetables, fallbackItems, 1);
  const protein = pick(proteins, fallbackItems, 0);

  return {
    mealPlan: [
      {
        day: "Monday",
        meal: `${vegetable.name} curry with ${staple.name}`,
      },
      {
        day: "Tuesday",
        meal: `${protein.name} with ${secondVegetable.name}`,
      },
    ],
    shoppingList: [
      { name: staple.name, quantity: staple.size },
      { name: vegetable.name, quantity: vegetable.size },
      { name: secondVegetable.name, quantity: secondVegetable.size },
      { name: protein.name, quantity: protein.size },
    ],
    notes: [
      "Meal plan generated only from affordable in-stock ingredients in the dummy price dataset.",
    ],
  };
}

module.exports = { generateMealPlan };
