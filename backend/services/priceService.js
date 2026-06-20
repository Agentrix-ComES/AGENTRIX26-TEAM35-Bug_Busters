const keells = require("../data/keells.json");
const cargills = require("../data/cargills.json");
const chromaReady = require("../../chroma_ready.json");

const MISSING_PRICE = Number.POSITIVE_INFINITY;

function normalizeName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function parseChromaRecord(record) {
  const match = record.text.match(
    /^(.*?) Store: (.*?) Price: ([\d.]+) LKR Size: (.*?) Category: (.*?) Availability: (.*)$/,
  );

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
  };
}

function fromStoreJson(storeName, storeData) {
  return (storeData.items || []).map((item) => ({
    id: `${storeName}_${normalizeName(item.name).replaceAll(" ", "_")}`,
    name: item.name,
    store: storeName,
    price: item.price_per_kg || item.price,
    size: item.size || (item.price_per_kg ? "per kg" : "per unit"),
    category: item.category || "Grocery",
    availability: item.availability || "in stock",
  }));
}

function loadRagItems() {
  const storeItems = [
    ...fromStoreJson("Keells", keells),
    ...fromStoreJson("Cargills", cargills),
  ].filter((item) => item.name && Number.isFinite(item.price));

  if (storeItems.length > 0) {
    return storeItems;
  }

  return chromaReady.map(parseChromaRecord).filter(Boolean);
}

const ragItems = loadRagItems();

function getPriceContext({ budget, pantryItems = [] } = {}) {
  const pantrySet = new Set(pantryItems.map(normalizeName));
  const budgetNumber = Number(budget);
  const maxIngredientPrice = Number.isFinite(budgetNumber)
    ? Math.max(budgetNumber * 0.25, 250)
    : Number.POSITIVE_INFINITY;

  const bestByIngredient = new Map();

  ragItems
    .filter((item) => item.availability.toLowerCase() === "in stock")
    .filter((item) => !pantrySet.has(normalizeName(item.name)))
    .forEach((item) => {
      const key = normalizeName(item.name);
      const current = bestByIngredient.get(key);

      if (!current || item.price < current.bestPrice) {
        bestByIngredient.set(key, {
          name: item.name,
          category: item.category,
          size: item.size,
          bestStore: item.store,
          bestPrice: item.price,
          storePrices: getStorePrices(item.name),
        });
      }
    });

  const affordableItems = [...bestByIngredient.values()]
    .filter((item) => item.bestPrice <= maxIngredientPrice)
    .sort((a, b) => a.bestPrice - b.bestPrice);

  return {
    source: "dummy-grocery-price-dataset",
    itemCount: ragItems.length,
    affordableItems,
    allItems: [...bestByIngredient.values()].sort((a, b) => a.bestPrice - b.bestPrice),
  };
}

function getStorePrices(itemName) {
  const requested = normalizeName(itemName);
  const prices = {};
  const exactMatches = ragItems.filter(
    (item) => normalizeName(item.name) === requested,
  );
  const matches =
    exactMatches.length > 0
      ? exactMatches
      : ragItems.filter((item) => {
          const current = normalizeName(item.name);

          return current.includes(requested) || requested.includes(current);
        });

  matches.forEach((item) => {
    prices[item.store] = Math.min(prices[item.store] || MISSING_PRICE, item.price);
  });

  return prices;
}

function comparePrices(shoppingList) {
  const result = [];

  shoppingList.forEach((item) => {
    const prices = getStorePrices(item.name);

    if (Object.keys(prices).length === 0) {
      result.push({
        item: item.name,
        quantity: item.quantity,
        prices: {},
        recommendedStore: null,
        recommendedPrice: 0,
        matched: false,
      });

      return;
    }

    const bestStore = Object.keys(prices).reduce((a, b) =>
      prices[a] < prices[b] ? a : b,
    );

    result.push({
      item: item.name,
      quantity: item.quantity,
      prices,
      recommendedStore: bestStore,
      recommendedPrice: prices[bestStore],
      matched: true,
    });
  });

  return result;
}

module.exports = { comparePrices, getPriceContext };
