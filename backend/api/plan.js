const express = require("express");
const router = express.Router();

const aiService = require("../services/aiService");
const priceService = require("../services/priceService");
const costService = require("../services/costService");

router.post("/plan", async (req, res) => {
  const userInput = req.body;

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
  });
});

module.exports = router;
