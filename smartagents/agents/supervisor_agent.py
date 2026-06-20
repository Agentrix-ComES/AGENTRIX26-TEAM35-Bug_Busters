from agents.meal_agent import meal_agent
from agents.price_agent import price_agent
from agents.shopping_agent import shopping_agent
from agents.rag_agent import rag_agent


def _has_any(text, keywords):
    return any(keyword in text for keyword in keywords)


def supervisor_agent(query: str):
    q = query.lower()

    if _has_any(
        q,
        [
            "price",
            "cost",
            "how much",
            "cheap",
            "cheapest",
            "lowest",
            "budget",
            "best value",
            "compare",
        ],
    ):
        return price_agent(query)

    if _has_any(
        q,
        [
            "cook",
            "recipe",
            "meal",
            "dinner",
            "lunch",
            "breakfast",
            "make",
        ],
    ):
        return meal_agent(query)

    if _has_any(
        q,
        [
            "available",
            "in stock",
            "do you have",
            "where",
            "which store",
            "store has",
        ],
    ):
        return rag_agent(query)

    if _has_any(
        q,
        [
            "buy",
            "shop",
            "shopping list",
            "cart",
            "purchase",
            "recommend groceries",
        ],
    ):
        return shopping_agent(query)

    return rag_agent(query)
