from agents.catalog import load_products, money, product_line


def _normalize(value):
    return str(value or "").lower().strip()


def _contains_any(value, keywords):
    text = _normalize(value)
    return any(keyword in text for keyword in keywords)


def _is_diet_allowed(product, diet_preference):
    diet = _normalize(diet_preference)
    category = _normalize(product.category)
    name = _normalize(product.name)

    if diet in {"vegetarian", "vegan"}:
        blocked_categories = {"meat", "fish / seafood"}
        blocked_names = ["chicken", "fish", "prawn", "cuttlefish", "beef", "mutton", "pork", "egg"]
        return category not in blocked_categories and not _contains_any(name, blocked_names)

    if diet == "halal":
        return not _contains_any(name, ["pork", "bacon", "ham", "wine", "alcohol"])

    return True


def _is_pantry_item(product, pantry_items):
    name = _normalize(product.name)
    return any(item and (item in name or name in item) for item in map(_normalize, pantry_items))


def _ingredient_key(product):
    name = _normalize(product.name)
    for token in ["cic", "bairaha", "renuka", "knorr", "catch", "mas", "kist", "maggi"]:
        name = name.replace(token, "")
    for token in ["chilled", "cleaned", "skinless", "whole", "small", "medium", "fresh"]:
        name = name.replace(token, "")
    return " ".join(name.split())


def rag_retrieval_agent(user_input):
    budget = float(user_input.get("budget") or 0)
    family_size = max(int(user_input.get("family_size") or 1), 1)
    pantry_items = user_input.get("pantry_items") or []
    max_price = max((budget / family_size) * 0.18, 250) if budget else float("inf")

    grouped = {}
    catalog_items = []

    for product in load_products():
        if product.availability.lower() != "in stock":
            continue
        if not _is_diet_allowed(product, user_input.get("diet_preference")):
            continue
        if _is_pantry_item(product, pantry_items):
            continue

        catalog_items.append(product)
        key = _ingredient_key(product)
        current = grouped.get(key)
        if current is None or product.price < current.price:
            grouped[key] = product

    affordable_items = sorted(
        [product for product in grouped.values() if product.price <= max_price],
        key=lambda product: product.price,
    )

    return {
        "source": "smartagents/vector_db/chroma_ready.json",
        "catalog_items": catalog_items,
        "affordable_items": affordable_items,
        "item_count": len(load_products()),
        "eligible_item_count": len(catalog_items),
    }


def _by_category(products, keywords):
    return [
        product
        for product in products
        if _contains_any(product.category, keywords) or _contains_any(product.name, keywords)
    ]


def _pick(items, index):
    if not items:
        return None
    return items[index % len(items)]


def meal_planning_agent(price_context):
    affordable = price_context["affordable_items"]
    if not affordable:
        return []

    vegetables = _by_category(affordable, ["vegetable", "fruit", "ingredient", "grocery"])
    proteins = _by_category(affordable, ["meat", "fish", "seafood", "mushroom"])
    staples = _by_category(affordable, ["flour", "grocery"])
    seasonings = _by_category(affordable, ["seasoning", "sauce", "oil"])

    meals = []
    for index in range(min(3, max(1, len(affordable) // 3))):
        ingredients = [
            _pick(staples, index),
            _pick(proteins, index),
            _pick(vegetables, index * 2),
            _pick(vegetables, index * 2 + 1),
            _pick(seasonings, index),
        ]
        ingredients = [item for item in ingredients if item is not None]
        unique_ingredients = []
        seen = set()
        for ingredient in ingredients:
            key = _ingredient_key(ingredient)
            if key not in seen:
                unique_ingredients.append(ingredient)
                seen.add(key)

        meal_name = " with ".join(item.name for item in unique_ingredients[:3])
        meals.append(
            {
                "day": f"Day {index + 1}",
                "meal": meal_name,
                "ingredients": unique_ingredients,
                "estimated_cost": sum(item.price for item in unique_ingredients),
            }
        )

    return meals


def shopping_list_agent(meal_plan, family_size):
    shopping_items = {}
    for meal in meal_plan:
        for product in meal["ingredients"]:
            key = _ingredient_key(product)
            shopping_items.setdefault(
                key,
                {
                    "name": product.name,
                    "quantity": f"{family_size} serving portions"
                    if product.size.lower().startswith("per ")
                    else f"{family_size} x {product.size}",
                    "category": product.category,
                    "used_in": [],
                },
            )
            shopping_items[key]["used_in"].append(meal["day"])
    return list(shopping_items.values())


def price_optimization_agent(shopping_list, catalog_items):
    rows = []
    for item in shopping_list:
        key = _normalize(item["name"])
        matches = [
            product
            for product in catalog_items
            if _normalize(product.name) == key or key in _normalize(product.name) or _normalize(product.name) in key
        ]
        prices = {}
        for product in matches:
            prices[product.store] = min(prices.get(product.store, float("inf")), product.price)

        if not prices:
            rows.append({**item, "prices": {}, "recommended_store": None, "recommended_price": 0, "savings": 0})
            continue

        recommended_store = min(prices, key=prices.get)
        baseline = max(prices.values())
        rows.append(
            {
                **item,
                "prices": prices,
                "recommended_store": recommended_store,
                "recommended_price": prices[recommended_store],
                "savings": max(baseline - prices[recommended_store], 0),
            }
        )
    return rows


def savings_summary_agent(vendor_table):
    total = sum(row["recommended_price"] for row in vendor_table)
    savings = sum(row["savings"] for row in vendor_table)
    return {"total": total, "savings": savings}


def _format_response(user_input, price_context, meal_plan, shopping_list, vendor_table, summary):
    lines = [
        "Final Response",
        "",
        "Workflow: User Input -> Supervisor Agent -> RAG Retrieval Agent -> Meal Planning Agent -> Shopping List Agent -> Price Optimization Agent -> Savings Summary Agent",
        "",
        "User Input:",
        f"- Family size: {user_input['family_size']}",
        f"- Budget: {money(user_input['budget'])} LKR",
        f"- Diet preference: {user_input['diet_preference']}",
        f"- Pantry items: {', '.join(user_input['pantry_items']) or 'None'}",
        f"- Location: {user_input['location']}",
        "",
        "RAG Retrieval Agent:",
        f"- Source: {price_context['source']}",
        f"- Eligible items: {price_context['eligible_item_count']} of {price_context['item_count']}",
        f"- Affordable items: {len(price_context['affordable_items'])}",
        "",
        "Meal Plan:",
    ]

    for meal in meal_plan:
        lines.append(f"- {meal['day']}: {meal['meal']} ({money(meal['estimated_cost'])} LKR)")

    lines.extend(["", "Shopping List:"])
    for item in shopping_list:
        lines.append(f"- {item['name']} ({item['quantity']}) - used in {', '.join(item['used_in'])}")

    lines.extend(["", "Vendor Table:"])
    for row in vendor_table:
        prices = ", ".join(f"{store}: {money(price)} LKR" for store, price in row["prices"].items()) or "No match"
        lines.append(
            f"- {row['name']}: {prices}; cheapest: {row['recommended_store'] or 'N/A'} "
            f"({money(row['recommended_price'])} LKR)"
        )

    lines.extend(
        [
            "",
            "Savings Summary:",
            f"- Optimized total: {money(summary['total'])} LKR",
            f"- Estimated savings: {money(summary['savings'])} LKR",
        ]
    )
    return "\n".join(lines)


def run_supervisor_pipeline(user_input):
    if not isinstance(user_input, dict):
        user_input = {
            "family_size": 1,
            "budget": 15000,
            "diet_preference": "No Preference",
            "pantry_items": [],
            "location": "Colombo",
        }

    price_context = rag_retrieval_agent(user_input)
    meal_plan = meal_planning_agent(price_context)
    shopping_list = shopping_list_agent(meal_plan, user_input["family_size"])
    vendor_table = price_optimization_agent(shopping_list, price_context["catalog_items"])
    summary = savings_summary_agent(vendor_table)
    response = _format_response(user_input, price_context, meal_plan, shopping_list, vendor_table, summary)

    return {
        "response": response,
        "price_context": price_context,
        "meal_plan": meal_plan,
        "shopping_list": shopping_list,
        "vendor_table": vendor_table,
        "summary": summary,
    }


def supervisor_agent(user_input):
    return run_supervisor_pipeline(user_input)["response"]
