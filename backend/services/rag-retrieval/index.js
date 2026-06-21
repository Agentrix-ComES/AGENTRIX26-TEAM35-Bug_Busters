const groceryPrices = require("../../data/grocery-prices.json");

const PRODUCT_PATTERN =
  /^(.*?) Store: (.*?) Price: ([\d.]+) LKR Size: (.*?) Category: (.*?) Availability: (.*)$/;

const DIET_BLOCKLIST = {
  vegetarian: ["meat", "fish / seafood"],
  vegan: ["meat", "fish / seafood"],
};

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function parseRecord(record) {
  const match = record.text.match(PRODUCT_PATTERN);

  if (!match) {
    return null;
  }

  return {
    id: record.id,
    name: match[1],
    store: match[2],
    price: Number(match[3]),
    size: match[4],
    category: match[5],
    availability: match[6],
    rawText: record.text,
  };
}

const catalog = groceryPrices.map(parseRecord).filter(Boolean);

function sameIngredientKey(name) {
  return normalizeText(name)
    .replace(/\b(cic|bairaha|renuka|knorr|catch|mas|kist|maggi)\b/g, "")
    .replace(/\b(chilled|cleaned|skinless|whole|small|medium|fresh)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isPantryMatch(item, pantryItems) {
  const itemName = normalizeText(item.name);

  return pantryItems.some((pantryItem) => {
    const pantryName = normalizeText(pantryItem);
    return pantryName && (itemName.includes(pantryName) || pantryName.includes(itemName));
  });
}

function isAvoidedIngredient(item, avoidItems) {
  const itemName = normalizeText(item.name);

  return avoidItems.some((avoidItem) => {
    const avoidName = normalizeText(avoidItem);
    return avoidName && itemName.includes(avoidName);
  });
}

function isDietMatch(item, dietPreference = "") {
  const diet = normalizeText(dietPreference);
  const blockedCategories = DIET_BLOCKLIST[diet] || [];
  const category = normalizeText(item.category);
  const name = normalizeText(item.name);

  if (blockedCategories.some((blocked) => category === blocked)) {
    return false;
  }

  if (diet === "halal") {
    return !/\b(pork|bacon|ham|wine|alcohol)\b/.test(name);
  }

  if (diet === "vegetarian" || diet === "vegan") {
    return !/\b(chicken|fish|prawn|cuttlefish|beef|mutton|pork|egg)\b/.test(name);
  }

  return true;
}

function bestByIngredient(items) {
  const grouped = new Map();

  items.forEach((item) => {
    const key = sameIngredientKey(item.name);
    const current = grouped.get(key);

    if (!current || item.price < current.bestPrice) {
      grouped.set(key, {
        name: item.name,
        category: item.category,
        size: item.size,
        bestStore: item.store,
        bestPrice: item.price,
        storePrices: {},
        candidates: [],
      });
    }
  });

  items.forEach((item) => {
    const key = sameIngredientKey(item.name);
    const groupedItem = grouped.get(key);

    if (groupedItem) {
      groupedItem.storePrices[item.store] = Math.min(
        groupedItem.storePrices[item.store] || Number.POSITIVE_INFINITY,
        item.price,
      );
      groupedItem.candidates.push(item);
    }
  });

  return [...grouped.values()].sort((a, b) => a.bestPrice - b.bestPrice);
}

function retrievePriceContext(userInput = {}) {
  const budget = Number(userInput.budget);
  const familySize = Math.max(Number(userInput.familySize) || 1, 1);
  const pantryItems = Array.isArray(userInput.pantryItems) ? userInput.pantryItems : [];
  const preferredMeals = Array.isArray(userInput.preferredMeals) ? userInput.preferredMeals : [];
  const avoidItems = [
    ...(Array.isArray(userInput.dislikedIngredients) ? userInput.dislikedIngredients : []),
    ...(Array.isArray(userInput.allergies) ? userInput.allergies : []),
  ];
  const perIngredientLimit = Number.isFinite(budget)
    ? Math.max((budget / Math.max(familySize, 1)) * 0.18, 250)
    : Number.POSITIVE_INFINITY;

  const eligibleCatalogItems = catalog
    .filter((item) => normalizeText(item.availability) === "in stock")
    .filter((item) => isDietMatch(item, userInput.dietPreference))
    .filter((item) => !isPantryMatch(item, pantryItems))
    .filter((item) => !isAvoidedIngredient(item, avoidItems));

  const groupedItems = bestByIngredient(eligibleCatalogItems);
  const affordableItems = groupedItems
    .filter((item) => item.bestPrice <= perIngredientLimit)
    .sort((a, b) => {
      const aPreferred = preferredMeals.some((meal) => normalizeText(a.name).includes(normalizeText(meal)));
      const bPreferred = preferredMeals.some((meal) => normalizeText(b.name).includes(normalizeText(meal)));

      if (aPreferred !== bPreferred) {
        return aPreferred ? -1 : 1;
      }

      return a.bestPrice - b.bestPrice;
    });

  return {
    source: "backend/data/grocery-prices.json",
    location: userInput.location || "Any supported store location",
    itemCount: catalog.length,
    eligibleItemCount: eligibleCatalogItems.length,
    affordableItems,
    allItems: groupedItems,
    catalogItems: eligibleCatalogItems,
    constraints: {
      familySize,
      budget: Number.isFinite(budget) ? budget : null,
      dietPreference: userInput.dietPreference || "No Preference",
      pantryItems,
      preferredMeals,
      avoidItems,
      perIngredientLimit,
    },
  };
}

module.exports = {
  normalizeText,
  retrievePriceContext,
};
