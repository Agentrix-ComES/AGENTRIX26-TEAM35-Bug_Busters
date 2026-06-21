from agents.catalog import money
from agents.supervisor_agent import (
    meal_planning_agent,
    rag_retrieval_agent,
    shopping_list_agent,
)


def meal_agent(query):
    price_context = rag_retrieval_agent(
        {
            "family_size": 1,
            "budget": 15000,
            "diet_preference": "No Preference",
            "pantry_items": [],
            "location": "Colombo",
        }
    )
    meal_plan = meal_planning_agent(price_context)
    shopping_list = shopping_list_agent(meal_plan, 1)

    if not meal_plan:
        return "Meal Planning Agent:\nNo affordable in-stock ingredients matched the current catalog."

    lines = ["Meal Planning Agent:", "Generated meals from retrieved grocery prices:"]
    for meal in meal_plan:
        lines.append(f"- {meal['day']}: {meal['meal']} ({money(meal['estimated_cost'])} LKR)")

    lines.extend(["", "Shopping List Agent preview:"])
    for item in shopping_list:
        lines.append(f"- {item['name']} ({item['quantity']})")

    return "\n".join(lines)
