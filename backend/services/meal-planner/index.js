function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function categoryIncludes(item, words) {
  const category = normalizeText(item.category);
  const name = normalizeText(item.name);
  return words.some((word) => category.includes(word) || name.includes(word));
}

function uniqueByName(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = normalizeText(item.name);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function rotatePick(items, index) {
  if (!items.length) {
    return null;
  }

  return items[index % items.length];
}

function preferenceScore(item, preferredMeals = []) {
  const itemName = normalizeText(item.name);
  return preferredMeals.reduce((score, meal) => {
    const preferred = normalizeText(meal);
    return preferred && itemName.includes(preferred) ? score + 1 : score;
  }, 0);
}

function sortByPreference(items, preferredMeals = []) {
  return [...items].sort((a, b) => {
    const preferenceDiff = preferenceScore(b, preferredMeals) - preferenceScore(a, preferredMeals);

    if (preferenceDiff !== 0) {
      return preferenceDiff;
    }

    return a.bestPrice - b.bestPrice;
  });
}

function buildMealTitle({ staple, protein, vegetables, supportItems }) {
  const mainItems = [
    protein?.name,
    vegetables.map((item) => item.name).join(" and "),
    staple?.name,
  ].filter(Boolean);

  if (mainItems.length >= 2) {
    return `${mainItems[0]} with ${mainItems.slice(1).join(", ")}`;
  }

  return [...mainItems, ...supportItems.map((item) => item.name)].filter(Boolean).join(" with ");
}

function buildMealPlan(priceContext = {}, userInput = {}) {
  const preferredMeals = Array.isArray(userInput.preferredMeals) ? userInput.preferredMeals : [];
  const affordableItems = sortByPreference(uniqueByName(priceContext.affordableItems || []), preferredMeals);

  if (affordableItems.length === 0) {
    return {
      mealPlan: [],
      notes: [
        "No affordable in-stock ingredients matched the current budget, diet, and pantry constraints.",
      ],
    };
  }

  const vegetables = sortByPreference(
    affordableItems.filter((item) =>
      categoryIncludes(item, ["vegetable", "fruit", "ingredient", "grocery"]),
    ),
    preferredMeals,
  );
  const proteins = sortByPreference(
    affordableItems.filter((item) =>
      categoryIncludes(item, ["meat", "fish", "seafood", "mushroom"]),
    ),
    preferredMeals,
  );
  const staples = sortByPreference(
    affordableItems.filter((item) =>
      categoryIncludes(item, ["flour", "grocery"]),
    ),
    preferredMeals,
  );
  const seasonings = sortByPreference(
    affordableItems.filter((item) =>
      categoryIncludes(item, ["seasoning", "sauce", "oil"]),
    ),
    preferredMeals,
  );

  const mealCount = Math.min(3, Math.max(1, Math.floor(affordableItems.length / 3)));
  const mealPlan = [];

  for (let index = 0; index < mealCount; index += 1) {
    const staple = rotatePick(staples, index);
    const protein = rotatePick(proteins, index);
    const firstVegetable = rotatePick(vegetables, index * 2);
    const secondVegetable = rotatePick(vegetables, index * 2 + 1);
    const supportItems = [rotatePick(seasonings, index)].filter(Boolean);
    const vegetablesForMeal = uniqueByName([firstVegetable, secondVegetable].filter(Boolean));
    const ingredients = uniqueByName(
      [staple, protein, ...vegetablesForMeal, ...supportItems].filter(Boolean),
    );

    mealPlan.push({
      day: `Day ${index + 1}`,
      meal: buildMealTitle({
        staple,
        protein,
        vegetables: vegetablesForMeal,
        supportItems,
      }),
      estimatedMealCost: ingredients.reduce((sum, item) => sum + item.bestPrice, 0),
      ingredients: ingredients.map((item) => ({
        name: item.name,
        category: item.category,
        size: item.size,
        bestPrice: item.bestPrice,
        bestStore: item.bestStore,
      })),
    });
  }

  return {
    mealPlan,
    notes: [
      `Planned from grocery price data using budget, diet, pantry, family size, location, and saved preferences.`,
      `${priceContext.affordableItems?.length || 0} affordable ingredients were available after filtering.`,
    ],
  };
}

module.exports = { generateMealPlan: buildMealPlan };
