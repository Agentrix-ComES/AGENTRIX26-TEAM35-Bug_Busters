function adaptResponseForFrontend(data, payload) {
    if (!data) return null;

    // Map mealPlan: {day, meal} -> {type, meal}
    const mealPlan = (data.mealPlan || []).map(item => ({
        type: item.day, // Re-map day to type
        meal: item.meal
    }));

    // Map shoppingList: flat array -> categorized object
    const shoppingList = {
        "Groceries": data.shoppingList || []
    };

    // Map priceComparison: vendorTable to array with keells, cargills, arpico, best
    const priceComparison = (data.vendorTable || []).map(row => ({
        item: row.item,
        keells: row.prices?.Keells || '-',
        cargills: row.prices?.Cargills || '-',
        arpico: row.prices?.Arpico || '-',
        best: row.recommendedStore || '-'
    }));

    // Map summary
    const summary = {
        estimatedTotal: data.totalEstimatedCost || 0,
        budget: payload.weeklyBudgetLKR || payload.budget || 0,
        savings: data.estimatedSavings || 0
    };

    return {
        mealPlan,
        shoppingList,
        priceComparison,
        summary,
        rawBackendResponse: data // useful for debugging
    };
}

export async function generatePlan(payload) {
    try {
        const response = await fetch("http://localhost:3000/api/plan", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return adaptResponseForFrontend(data, payload);
    } catch (error) {
        console.error("Failed to generate plan:", error);
        throw error;
    }
}
