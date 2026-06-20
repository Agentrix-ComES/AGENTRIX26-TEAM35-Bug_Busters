from agents.catalog import (
    extract_item_queries,
    money,
    product_line,
    search_products,
    sort_by_value,
)


def _best_for_item(item):
    matches = search_products(item, limit=8)
    if not matches:
        return None

    exact_matches = [
        product
        for product in matches
        if product.name.lower() == item.lower()
        or product.name.lower().rstrip("s") == item.lower().rstrip("s")
    ]
    if exact_matches:
        return sort_by_value(exact_matches)[0]

    return matches[0]


def shopping_agent(query):
    item_queries = extract_item_queries(query)

    if not item_queries:
        return (
            "Shopping Agent:\n"
            "Tell me the grocery items you want, for example: "
            "'buy carrot, chicken and coconut milk'."
        )

    found = []
    missing = []

    for item in item_queries:
        product = _best_for_item(item)
        if product is None:
            missing.append(item)
        else:
            found.append((item, product))

    if not found:
        return (
            "Shopping Agent:\n"
            "I could not match those items to the current grocery catalog."
        )

    total = sum(product.price for _, product in found)
    lines = ["Shopping Agent:", "Recommended cart:"]
    for item, product in found:
        lines.append(f"- {item}: {product_line(product, include_unit_price=True)}")

    lines.append(f"\nEstimated total for one listed unit each: {money(total)} LKR")

    if missing:
        lines.append(f"Not found in catalog: {', '.join(missing)}")

    return "\n".join(lines)
