import json
import re
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[1]
CATALOG_PATH = BASE_DIR / "vector_db" / "chroma_ready.json"


@dataclass(frozen=True)
class Product:
    id: str
    name: str
    store: str
    price: float
    currency: str
    size: str
    category: str
    availability: str
    text: str


_PRODUCT_PATTERN = re.compile(
    r"^(?P<name>.*?) Store: (?P<store>.*?) Price: (?P<price>[0-9.]+) "
    r"(?P<currency>[A-Z]+) Size: (?P<size>.*?) Category: "
    r"(?P<category>.*?) Availability: (?P<availability>.*?)$"
)

_STOP_WORDS = {
    "a",
    "about",
    "all",
    "an",
    "and",
    "any",
    "are",
    "available",
    "best",
    "buy",
    "can",
    "cheap",
    "cheapest",
    "cook",
    "cost",
    "do",
    "find",
    "for",
    "from",
    "give",
    "have",
    "how",
    "i",
    "in",
    "is",
    "item",
    "items",
    "list",
    "make",
    "me",
    "meal",
    "need",
    "of",
    "please",
    "price",
    "product",
    "products",
    "purchase",
    "recipe",
    "recommend",
    "shop",
    "shopping",
    "should",
    "show",
    "store",
    "tell",
    "the",
    "there",
    "to",
    "want",
    "what",
    "where",
    "which",
    "with",
}

_ALIASES = {
    "bell": "capsicum",
    "chilies": "chillies",
    "chili": "chillies",
    "chilli": "chillies",
    "eggplant": "brinjal",
    "onions": "onion",
    "potatoes": "potato",
    "prawns": "prawn",
}


def _parse_product(raw_item):
    text = raw_item["text"]
    match = _PRODUCT_PATTERN.match(text)
    if not match:
        raise ValueError(f"Could not parse catalog row: {text}")

    data = match.groupdict()
    return Product(
        id=raw_item["id"],
        name=data["name"],
        store=data["store"],
        price=float(data["price"]),
        currency=data["currency"],
        size=data["size"],
        category=data["category"],
        availability=data["availability"],
        text=text,
    )


@lru_cache(maxsize=1)
def load_products():
    with CATALOG_PATH.open("r", encoding="utf-8") as file:
        return tuple(_parse_product(item) for item in json.load(file))


def money(value):
    if float(value).is_integer():
        return str(int(value))
    return f"{value:.2f}".rstrip("0").rstrip(".")


def product_line(product, include_unit_price=False):
    line = (
        f"{product.name} - {product.store}, {money(product.price)} "
        f"{product.currency}, {product.size}, {product.availability}"
    )

    if include_unit_price:
        unit = unit_price(product)
        if unit:
            value, label = unit
            line += f" ({money(value)} {product.currency} per {label})"

    return line


def _tokens(text):
    tokens = re.findall(r"[a-z0-9]+", text.lower())
    normalized = []
    for token in tokens:
        token = _ALIASES.get(token, token)
        if len(token) > 3 and token.endswith("s"):
            token = token[:-1]
        normalized.append(token)
    return normalized


def important_tokens(text):
    return [token for token in _tokens(text) if token not in _STOP_WORDS]


def _score_product(product, query):
    query_tokens = important_tokens(query)
    if not query_tokens:
        query_tokens = _tokens(query)

    name_tokens = important_tokens(product.name)
    name = product.name.lower()
    category = product.category.lower()
    store = product.store.lower()
    blob = f"{product.name} {product.category} {product.store}".lower()
    product_tokens = set(_tokens(blob))
    phrase = " ".join(query_tokens)
    score = 0

    if phrase and phrase in name:
        score += 14
    elif phrase and phrase in blob:
        score += 6

    if query_tokens and name_tokens[-len(query_tokens) :] == query_tokens:
        score += 5
    if query_tokens and all(token in name_tokens for token in query_tokens):
        score += max(0, 4 - (len(name_tokens) - len(query_tokens)))

    for token in query_tokens:
        if token in product_tokens:
            score += 3
        if token in name:
            score += 2
        if token in category:
            score += 2
        if token in store:
            score += 2

    if "chicken" in query_tokens and product.category.lower() == "meat":
        score += 5
    if "fish" in query_tokens and "fish" in product.category.lower():
        score += 12
    if query_tokens == ["fish"] and "sauce" in product.category.lower():
        score -= 8
    if "vegetable" in query_tokens and product.category.lower() == "vegetable":
        score += 5

    return score


def search_products(query, limit=5, min_score=1):
    scored = []
    for index, product in enumerate(load_products()):
        score = _score_product(product, query)
        if score >= min_score:
            scored.append((score, index, product))

    scored.sort(key=lambda item: (-item[0], item[1]))
    return [product for _, _, product in scored[:limit]]


def unit_price(product):
    size = product.size.strip().lower()

    if size == "per kg":
        return product.price, "kg"
    if size == "per unit":
        return product.price, "unit"

    match = re.fullmatch(r"([0-9.]+)\s*(g|kg|ml|l|pcs)", size)
    if not match:
        return None

    amount = float(match.group(1))
    unit = match.group(2)
    if amount <= 0:
        return None

    if unit == "g":
        return product.price / (amount / 1000), "kg"
    if unit == "kg":
        return product.price / amount, "kg"
    if unit == "ml":
        return product.price / (amount / 1000), "L"
    if unit == "l":
        return product.price / amount, "L"
    if unit == "pcs":
        return product.price / amount, "piece"

    return None


def sort_by_value(products):
    products = list(products)
    with_unit = [(unit_price(product), product) for product in products]
    comparable = [(unit, product) for unit, product in with_unit if unit is not None]

    if comparable:
        most_common_label = max(
            {unit[1] for unit, _ in comparable},
            key=lambda label: sum(1 for unit, _ in comparable if unit[1] == label),
        )
        same_unit = [
            (unit[0], product)
            for unit, product in comparable
            if unit[1] == most_common_label
        ]
        if same_unit:
            return [product for _, product in sorted(same_unit, key=lambda item: item[0])]

    return sorted(products, key=lambda product: product.price)


def extract_item_queries(query):
    text = query.lower()
    text = re.sub(r"[^a-z0-9,&/ ]+", " ", text)
    text = re.sub(r"\b(and|plus|with|using|also)\b", ",", text)
    text = re.sub(
        r"\b(can you|could you|i want to|want to|need to|show me|tell me|"
        r"give me|find me|how much is|how much are|price of|cost of|"
        r"where can i buy|where to buy|shopping list for|shop for|buy|"
        r"recommend|purchase|make|cook|recipe for|recipe)\b",
        " ",
        text,
    )

    items = []
    for part in text.split(","):
        tokens = important_tokens(part)
        if tokens:
            value = " ".join(tokens)
            if value not in items:
                items.append(value)

    if not items:
        tokens = important_tokens(query)
        if tokens:
            items.append(" ".join(tokens))

    return items


def best_match(query):
    products = search_products(query, limit=1)
    return products[0] if products else None


def best_value_match(query):
    products = search_products(query, limit=10)
    if not products:
        return None
    return sort_by_value(products)[0]
