from agents.catalog import extract_item_queries, money, product_line, search_products


_MEAL_TEMPLATES = {
    "chicken curry": [
        "chicken",
        "coconut milk",
        "big onion",
        "garlic",
        "ginger",
        "green chillies",
    ],
    "fried rice": [
        "chicken",
        "carrot",
        "green beans",
        "cabbage",
        "big onion",
        "soy sauce",
        "fried rice seasoning",
    ],
    "fish curry": [
        "fish",
        "coconut milk",
        "big onion",
        "garlic",
        "ginger",
        "green chillies",
        "lime",
    ],
    "vegetable curry": [
        "carrot",
        "potatoes",
        "green beans",
        "brinjal",
        "coconut milk",
        "green chillies",
    ],
}


def _choose_meal(query):
    q = query.lower()
    for meal_name in _MEAL_TEMPLATES:
        if meal_name in q:
            return meal_name

    if "fried rice" in q:
        return "fried rice"
    if "fish" in q and "curry" in q:
        return "fish curry"
    if "chicken" in q:
        return "chicken curry"
    if any(word in q for word in ["vegetable", "veggie", "veg", "brinjal"]):
        return "vegetable curry"

    item_queries = extract_item_queries(query)
    if any("chicken" in item for item in item_queries):
        return "chicken curry"
    if any("fish" in item for item in item_queries):
        return "fish curry"
    if any("rice" in item for item in item_queries):
        return "fried rice"

    return "vegetable curry"


def _first_match(item):
    products = search_products(item, limit=5)
    return products[0] if products else None


def meal_agent(query):
    meal_name = _choose_meal(query)
    ingredients = _MEAL_TEMPLATES[meal_name]
    available = []
    missing = []

    for ingredient in ingredients:
        product = _first_match(ingredient)
        if product is None:
            missing.append(ingredient)
        else:
            available.append((ingredient, product))

    if not available:
        return (
            "Meal Agent Response:\n"
            "I could not match ingredients for that meal in the current catalog."
        )

    total = sum(product.price for _, product in available)
    lines = [
        "Meal Agent Response:",
        f"Suggested real-world meal: {meal_name.title()}",
        "",
        "Ingredients you can buy:",
    ]

    for ingredient, product in available:
        lines.append(f"- {ingredient}: {product_line(product)}")

    lines.extend(
        [
            "",
            f"Estimated grocery total for one listed unit each: {money(total)} LKR",
            "",
            "Simple cooking plan:",
            "1. Prepare and cut the vegetables, meat, or seafood.",
            "2. Cook onion, garlic, ginger, and chillies first if they are in the list.",
            "3. Add the main ingredient and cook until nearly done.",
            "4. Add coconut milk, sauce, or seasoning where listed and simmer.",
            "5. Taste, adjust salt/spice, and serve hot.",
        ]
    )

    if missing:
        lines.append(f"\nNot found in catalog: {', '.join(missing)}")

    return "\n".join(lines)
