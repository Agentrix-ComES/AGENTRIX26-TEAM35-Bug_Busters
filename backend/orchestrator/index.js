const ragService = require("../services/rag-retrieval");
const mealService = require("../services/meal-planner");
const shoppingService = require("../services/shopping-list");
const priceService = require("../services/price-optimizer");
const costService = require("../services/savings-summary");
const profileMemory = require("../services/profile-memory");

async function orchestratePlan(userInput) {
    const normalizedInput = profileMemory.mergeWithProfile(userInput);

    // RAG Retrieval Agent
    const priceContext = ragService.retrievePriceContext(normalizedInput);

    // Meal Planning Agent
    const mealOutput = await mealService.generateMealPlan(priceContext, normalizedInput);

    // Shopping List Agent
    const shoppingList = shoppingService.createShoppingList(mealOutput.mealPlan, normalizedInput);

    // Price Optimization Agent
    const vendorTable = priceService.comparePrices(shoppingList, priceContext);

    // Savings Summary Agent
    const costSummary = costService.calculate(vendorTable);
    const savedProfile = profileMemory.saveProfile(normalizedInput);

    return {
        workflow: [
            "Supervisor Agent",
            "RAG Retrieval Agent",
            "Meal Planning Agent",
            "Shopping List Agent",
            "Price Optimization Agent",
            "Savings Summary Agent",
        ],
        userInput: normalizedInput,
        personalization: {
            email: normalizedInput.email || null,
            profileLoaded: normalizedInput.profileLoaded,
            profileSaved: Boolean(savedProfile),
            preferredMeals: normalizedInput.preferredMeals,
            budgetRange: normalizedInput.budgetRange,
        },
        priceContext: {
            source: priceContext.source,
            location: priceContext.location,
            itemCount: priceContext.itemCount,
            eligibleItemCount: priceContext.eligibleItemCount,
            affordableItemCount: priceContext.affordableItems.length,
            sampleAffordableItems: priceContext.affordableItems.slice(0, 8),
            constraints: priceContext.constraints,
        },
        mealPlan: mealOutput.mealPlan,
        shoppingList,
        vendorTable,
        totalEstimatedCost: costSummary.total,
        estimatedSavings: costSummary.savings,
        baselineCost: costSummary.baseline,
        notes: [
            ...mealOutput.notes,
            savedProfile
                ? "Preferences were saved for future meal plans using the provided email."
                : "Add an email to save preferences for future meal plans.",
        ],
    };
}

module.exports = { orchestratePlan };
