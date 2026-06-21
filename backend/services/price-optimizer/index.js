const { normalizeText } = require("../rag-retrieval");

function sameIngredientKey(name) {
  return normalizeText(name)
    .replace(/\b(cic|bairaha|renuka|knorr|catch|mas|kist|maggi)\b/g, "")
    .replace(/\b(chilled|cleaned|skinless|whole|small|medium|fresh)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function findMatches(itemName, catalogItems) {
  const requested = sameIngredientKey(itemName);
  const exactMatches = catalogItems.filter((item) => sameIngredientKey(item.name) === requested);

  if (exactMatches.length > 0) {
    return exactMatches;
  }

  return catalogItems.filter((item) => {
    const current = sameIngredientKey(item.name);
    return current.includes(requested) || requested.includes(current);
  });
}

function getStorePrices(itemName, catalogItems) {
  return findMatches(itemName, catalogItems).reduce((prices, item) => {
    prices[item.store] = Math.min(prices[item.store] || Number.POSITIVE_INFINITY, item.price);
    return prices;
  }, {});
}

function comparePrices(shoppingList = [], priceContext = {}) {
  const catalogItems = priceContext.catalogItems || [];

  return shoppingList.map((item) => {
    const prices = getStorePrices(item.name, catalogItems);
    const stores = Object.keys(prices);

    if (stores.length === 0) {
      return {
        item: item.name,
        quantity: item.quantity,
        prices: {},
        recommendedStore: null,
        recommendedPrice: 0,
        matched: false,
      };
    }

    const recommendedStore = stores.reduce((bestStore, store) =>
      prices[store] < prices[bestStore] ? store : bestStore,
    );
    const highestPrice = stores.reduce((highest, store) => Math.max(highest, prices[store]), 0);

    return {
      item: item.name,
      quantity: item.quantity,
      prices,
      recommendedStore,
      recommendedPrice: prices[recommendedStore],
      highestComparablePrice: highestPrice,
      itemSavings: Math.max(highestPrice - prices[recommendedStore], 0),
      matched: true,
    };
  });
}

module.exports = { comparePrices };
