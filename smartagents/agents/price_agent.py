from agents.catalog import product_line, search_products, sort_by_value


def _lines(products, include_unit_price=False):
    return "\n".join(
        f"- {product_line(product, include_unit_price=include_unit_price)}"
        for product in products
    )


def price_agent(query):
    products = search_products(query, limit=10)

    if not products:
        return (
            "Price Agent:\n"
            "I could not find a matching product in the catalog. Try a clearer "
            "product name, for example 'price of coconut milk' or 'chicken price'."
        )

    q = query.lower()
    wants_value = any(
        word in q
        for word in ["cheap", "cheapest", "lowest", "best value", "budget", "compare"]
    )

    if wants_value:
        ranked = sort_by_value(products)[:5]
        return (
            "Price Agent:\n"
            f"Best value option: {product_line(ranked[0], include_unit_price=True)}\n\n"
            f"Other price options:\n{_lines(ranked[1:], include_unit_price=True)}"
        )

    best = products[0]
    alternatives = products[1:5]
    response = (
        "Price Agent:\n"
        f"{best.name} costs {best.price:g} {best.currency} at {best.store} "
        f"for {best.size}. Availability: {best.availability}."
    )

    if alternatives:
        response += f"\n\nRelated prices:\n{_lines(alternatives)}"

    return response
