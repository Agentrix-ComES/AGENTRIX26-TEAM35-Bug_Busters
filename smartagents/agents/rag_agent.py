from agents.catalog import product_line, search_products, sort_by_value


def retrieve(query: str, k: int = 5):
    return [product.text for product in search_products(query, limit=k)]


def _format_product_list(products, include_unit_price=False):
    return "\n".join(
        f"- {product_line(product, include_unit_price=include_unit_price)}"
        for product in products
    )


def _answer_availability(products):
    in_stock = [
        product
        for product in products
        if "stock" in product.availability.lower()
    ]

    if not in_stock:
        return "I could not confirm that item as in stock from the local catalog."

    stores = sorted({product.store for product in in_stock})
    return (
        f"Yes. I found {len(in_stock)} matching in-stock option(s) at "
        f"{', '.join(stores)}:\n{_format_product_list(in_stock[:5])}"
    )


def _answer_store(products):
    stores = {}
    for product in products:
        stores.setdefault(product.store, []).append(product)

    lines = ["You can find matching products at:"]
    for store, store_products in stores.items():
        best = store_products[0]
        lines.append(f"- {store}: {product_line(best)}")

    return "\n".join(lines)


def rag_agent(query: str):
    products = search_products(query, limit=8)

    if not products:
        return (
            "I could not find that in the current grocery catalog. "
            "Try asking with a product name such as 'coconut milk', 'carrot', "
            "or 'chicken'."
        )

    q = query.lower()

    if any(word in q for word in ["available", "in stock", "do you have"]):
        return _answer_availability(products)

    if any(word in q for word in ["where", "which store", "store has"]):
        return _answer_store(products)

    if any(word in q for word in ["cheapest", "lowest", "best value"]):
        ranked = sort_by_value(products)[:5]
        return (
            f"Best value match: {product_line(ranked[0], include_unit_price=True)}\n\n"
            f"Other options:\n{_format_product_list(ranked[1:], include_unit_price=True)}"
        )

    best = products[0]
    alternatives = products[1:5]
    answer = (
        f"Best match: {product_line(best, include_unit_price=True)}\n"
        f"Category: {best.category}."
    )

    if alternatives:
        answer += f"\n\nRelated options:\n{_format_product_list(alternatives)}"

    return answer
