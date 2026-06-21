const express = require("express");
const router = express.Router();

const aiService = require("../services/aiService");
const priceService = require("../services/priceService");
const costService = require("../services/costService");

router.post("/plan", async (req, res) => {
  const userInput = req.body;

  let budgetVal = userInput.budget !== undefined ? userInput.budget : userInput.weeklyBudgetLKR;
  budgetVal = Number(budgetVal);

  if (!Number.isFinite(budgetVal) || budgetVal <= 0) {
    return res.status(400).json({ error: "A valid numeric budget or weeklyBudgetLKR is required." });
  }

  const inputPantryItems = userInput.pantryItems || [];
  const receiptText = userInput.receiptText || "";
  let extractedItems = [];
  if (receiptText) {
    extractedItems = receiptText.split(/\\n|\r?\n/).map(item => {
      return item.toLowerCase()
        .replace(/\d+/g, '')
        .replace(/\b(kg|g|pack|pcs|pieces|ml|l|box)\b/g, '')
        .trim();
    }).filter(i => i.length > 0);
  }
  const combinedPantryItems = Array.from(new Set([...inputPantryItems.map(i => i.toLowerCase().trim()), ...extractedItems]));
  userInput.pantryItems = combinedPantryItems;

  const receiptExtraction = receiptText ? {
    enabled: true,
    extractedItems,
    note: "Receipt text was parsed and extracted items were treated as available pantry items."
  } : {
    enabled: false,
    extractedItems: [],
    note: "No receipt text was provided."
  };

  const pantryImpact = {
    inputPantryItems,
    receiptPantryItems: extractedItems,
    combinedPantryItems,
    estimatedAvoidedPurchases: combinedPantryItems.length,
    note: "Available pantry and receipt items were used to reduce unnecessary purchases."
  };

  const familySize = userInput.familySize;
  const householdScaling = familySize ? {
    familySize: Number(familySize),
    scalingApplied: true,
    note: "Shopping quantities are estimated for a household of " + familySize + " people. Pack sizes are based on available grocery dataset units."
  } : {
    familySize: null,
    scalingApplied: false,
    note: "Family size was not provided, so default MVP quantities were used."
  };

  // Supervisor Agent -> RAG Retrieval Agent
  const priceContext = priceService.getPriceContext(userInput);

  // Meal Planning Agent uses price context before creating meals.
  const aiOutput = aiService.generateMealPlan(userInput, priceContext);

  // Shopping List Agent
  const shoppingList = aiOutput.shoppingList;

  // Price Optimization Agent
  const vendorTable = priceService.comparePrices(shoppingList);

  // Savings Summary Agent
  const costSummary = costService.calculate(vendorTable);

  const storeBasketMap = {};
  vendorTable.forEach(item => {
    if (item.matched && item.recommendedStore) {
      if (!storeBasketMap[item.recommendedStore]) {
        storeBasketMap[item.recommendedStore] = {
          store: item.recommendedStore,
          items: [],
          estimatedStoreTotal: 0,
          reason: `These items were cheapest at ${item.recommendedStore}.`
        };
      }
      storeBasketMap[item.recommendedStore].items.push(item.item);
      storeBasketMap[item.recommendedStore].estimatedStoreTotal += item.recommendedPrice;
    }
  });
  const storeBasketStrategy = Object.values(storeBasketMap);

  const savingsExplanation = {
    baselineStore: "Keells",
    optimizedStrategy: "Cheapest available vendor per item",
    summary: "The system compares available vendor prices and recommends lower-cost options instead of assuming all groceries are bought from one supermarket.",
    estimatedSavings: costSummary.savings
  };

  let status = "within_budget";
  if (costSummary.total > budgetVal) {
    status = "over_budget";
  } else if (costSummary.total > budgetVal * 0.8) {
    status = "near_limit";
  }
  const budgetHealth = {
    budget: budgetVal,
    estimatedTotal: costSummary.total,
    status,
    remainingBudget: budgetVal - costSummary.total,
    message: status === "over_budget" ? "The generated grocery plan exceeds the submitted weekly budget." : "The generated grocery plan is within the submitted weekly budget."
  };

  const finalRecommendation = {
    title: "Budget-friendly grocery plan generated",
    summary: "GrocerMind AI created a price-aware meal plan, avoided pantry duplicates, compared vendor prices, and estimated savings.",
    nextBestAction: "Review the store-wise basket strategy and purchase recommended items from the suggested vendors."
  };

  res.json({
    workflow: [
      "Supervisor Agent",
      "RAG Retrieval Agent",
      "Meal Planning Agent",
      "Shopping List Agent",
      "Price Optimization Agent",
      "Savings Summary Agent",
    ],
    priceContext: {
      source: priceContext.source,
      itemCount: priceContext.itemCount,
      affordableItemCount: priceContext.affordableItems.length,
      sampleAffordableItems: priceContext.affordableItems.slice(0, 8),
    },
    mealPlan: aiOutput.mealPlan,
    shoppingList,
    vendorTable,
    totalEstimatedCost: costSummary.total,
    estimatedSavings: costSummary.savings,
    notes: aiOutput.notes,
    // Pro Features
    receiptExtraction,
    pantryImpact,
    householdScaling,
    storeBasketStrategy,
    savingsExplanation,
    budgetHealth,
    finalRecommendation
  });
});

module.exports = router;
