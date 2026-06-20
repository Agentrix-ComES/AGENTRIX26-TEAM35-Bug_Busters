import json
import re


def infer_category(name):
    """Dynamically infers category based on keywords in the item name."""
    name_lower = name.lower()

    # Category mapping rules
    if any(k in name_lower for k in ['oil', 'canola', 'sunflower']):
        return "Cooking Oil"
    if any(k in name_lower for k in ['sauce', 'ketchup']):
        return "Sauce"
    if any(k in name_lower for k in ['powder', 'milk powder']):
        return "Grocery" if "milk" in name_lower else "Ingredient"
    if any(k in name_lower for k in ['flour', 'atta', 'chakki']):
        return "Flour"
    if any(k in name_lower for k in ['cube', 'seasoning', 'mix', 'bonda', 'fried rice']):
        return "Seasoning / Mix"
    if any(k in name_lower for k in ['fish', 'chips', 'handella', 'moralla', 'paraw', 'sudaya', 'allagoduw']):
        return "Fish / Seafood"
    if any(k in name_lower for k in ['chicken', 'wings', 'breast', 'drumsticks', 'meat']):
        return "Meat"
    if any(k in name_lower for k in ['carrot', 'potato', 'tomato', 'cabbage', 'onion', 'capsicum', 'beans', 'garlic', 'ginger', 'broccoli', 'vegetable']):
        return "Vegetable"
    if 'coconut' in name_lower:
        return "Fruit / Ingredient"

    return "Grocery"


def clean_id(store_name, item_name):
    """Creates a clean, database-safe unique ID."""
    clean_name = re.sub(re.compile(
        r'[^a-zA-Z0-9\s]'), '', item_name)  # Remove special characters
    clean_name = clean_name.strip().replace(" ", "_").lower()
    return f"{store_name.lower()}_{clean_name}"


def generate_rag_documents(cargills_items, keells_items):
    chroma_docs = []

    # 1. Process Cargills
    for item in cargills_items:
        category = infer_category(item["name"])
        text_doc = (
            f"{item['name']} "
            f"Store: Cargills "
            f"Price: {item['price']} LKR "
            f"Size: {item.get('size', 'N/A')} "
            f"Category: {category} "
            f"Availability: {item.get('availability', 'in stock')}"
        )
        chroma_docs.append({
            "id": clean_id("cargills", item["name"]),
            "text": text_doc
        })

    # 2. Process Keells
    for item in keells_items:
        category = infer_category(item["name"])
        # Format size text based on whether it's a per-kg or fixed item
        size_text = item.get("size", "per kg" if category == "Vegetable" or category ==
                             "Fish / Seafood" or category == "Meat" else "N/A")

        text_doc = (
            f"{item['name']} "
            f"Store: Keells "
            f"Price: {item['price']} LKR "
            f"Size: {size_text} "
            f"Category: {category} "
            f"Availability: {item.get('availability', 'in stock')}"
        )
        chroma_docs.append({
            "id": clean_id("keells", item["name"]),
            "text": text_doc
        })

    return chroma_docs


# --- RUN EXECUTION ---
if __name__ == "__main__":
    # Sample Raw Structure Representation (Replace these lists with your actual file loading if separate)
    # e.g., cargills_raw = json.load(open('cargills_raw.json'))

    cargills_raw = [
        {"name": "Renuka Coconut Milk Powder", "price": 896, "size": "300 g"},
        {"name": "Catch Crispy Fried Chicken Mix", "price": 140, "size": "100 g"},
        {"name": "Knorr Coconut Milk Powder", "price": 896, "size": "300 g"},
        {"name": "Catch Ulundu Flour", "price": 384, "size": "200 g"},
        {"name": "Turkey Canola Oil", "price": 1960, "size": "1 L"},
        {"name": "Knorr Seasoning Cubes Handy Pack", "price": 780, "size": "120 g"},
        {"name": "Kist Squeeasy Sauce Devilled", "price": 290, "size": "200 g"},
        {"name": "Seven Star Chakki Atta Flour", "price": 325, "size": "1 kg"},
        {"name": "Silvermill Coconut Milk", "price": 375, "size": "330 ml"},
        {"name": "Gold Winner Sunflower Oil", "price": 3250, "size": "2 L"},
        {"name": "MAGGI Chicken Flavored Seasoning Cubes",
            "price": 72, "size": "16 g"},
        {"name": "Edinborough Fish Sauce", "price": 590.75, "size": "350 ml"},
        {"name": "Fortune Cocofine RBD Coconut Oil", "price": 4500, "size": "2.9 L"},
        {"name": "Ma's Chinese Fried Rice Seasoning", "price": 255, "size": "50 g"},
        {"name": "Catch Bajji Bonda Batter Mix", "price": 161.5, "size": "100 g"},
        {"name": "My Choice Maldive Fish Chips", "price": 460, "size": "100 g"},
        {"name": "Coconut Miracle Pure Virgin Coconut Oil",
            "price": 1799, "size": "500 ml"},
        {"name": "Marina Coconut Oil", "price": 1450, "size": "675 ml"},
        {"name": "Edinborough Soy Sauce", "price": 320, "size": "350 g"},
        {"name": "Big Onion", "price": 165, "size": "500 g"},
        {"name": "Coconut", "price": 414, "size": "3 pcs"},
        {"name": "Carrot", "price": 280, "size": "500 g"},
        {"name": "Potatoes", "price": 185, "size": "500 g"},
        {"name": "Tomato", "price": 430, "size": "500 g"},
        {"name": "Garlic", "price": 225, "size": "250 g"},
        {"name": "Green Beans", "price": 195, "size": "250 g"},
        {"name": "Brinjal", "price": 126, "size": "350 g"},
        {"name": "Raw Ginger", "price": 180, "size": "150 g"},
        {"name": "Capsicum", "price": 140, "size": "250 g"},
        {"name": "Sweet Potatoes", "price": 146, "size": "500 g"},
        {"name": "Leeks", "price": 130, "size": "250 g"},
        {"name": "Cauliflower", "price": 276, "size": "300 g"},
        {"name": "Green Chillies", "price": 88, "size": "100 g"},
        {"name": "Cabbage", "price": 70, "size": "500 g"},
        {"name": "Red Onion", "price": 128, "size": "250 g"},
        {"name": "Beetroot", "price": 143, "size": "250 g"},
        {"name": "Lime", "price": 175, "size": "250 g"},
        {"name": "Broccoli", "price": 705, "size": "300 g"},
        {"name": "Pumpkin", "price": 50, "size": "500 g"}
    ]

    keells_raw = [
        {"name": "Allagoduw", "price": 1690, "size": "per kg"},
        {"name": "Cleaned Handella", "price": 3400, "size": "per kg"},
        {"name": "Kumbalawa", "price": 1890, "size": "per kg"},
        {"name": "Linna", "price": 1790, "size": "per kg"},
        {"name": "Moralla Fish", "price": 1790, "size": "per kg"},
        {"name": "Paraw Small", "price": 2290, "size": "per kg"},
        {"name": "Prawns Medium", "price": 1790, "size": "per kg"},
        {"name": "Sudaya", "price": 980, "size": "per kg"},
        {"name": "Thalapath Small", "price": 2370, "size": "per kg"},
        {"name": "Cleaned Cuttlefish", "price": 2590, "size": "per kg"},
        {"name": "Oyster Mushroom", "price": 200, "size": "per unit"},
        {"name": "Ash Plantains", "price": 176, "size": "per kg"},
        {"name": "Batana", "price": 920, "size": "per kg"},
        {"name": "Beetroot", "price": 400, "size": "per kg"},
        {"name": "Bell Pepper Green", "price": 990, "size": "per kg"},
        {"name": "Bell Pepper Red", "price": 1920, "size": "per kg"},
        {"name": "Bell Pepper Yellow", "price": 1490, "size": "per kg"},
        {"name": "Big Onions", "price": 280, "size": "per kg"},
        {"name": "Bitter Gourd", "price": 680, "size": "per kg"},
        {"name": "Brinjals", "price": 420, "size": "per kg"},
        {"name": "Broccoli", "price": 3780, "size": "per kg"},
        {"name": "Cabbage", "price": 136, "size": "per kg"},
        {"name": "Cabbage Leaves", "price": 380, "size": "per kg"},
        {"name": "Capsicum", "price": 540, "size": "per kg"},
        {"name": "Carrot", "price": 560, "size": "per kg"},
        {"name": "Cauliflower", "price": 940, "size": "per kg"},
        {"name": "Celery", "price": 1890, "size": "per kg"},
        {"name": "Cherry Tomato", "price": 4440, "size": "per kg"},
        {"name": "Chinese Cabbage", "price": 1350, "size": "per kg"},
        {"name": "Chow Chow", "price": 360, "size": "per kg"},
        {"name": "Coconut", "price": 139, "size": "per unit"},
        {"name": "Coriander Leaves", "price": 1620, "size": "per kg"},
        {"name": "Cucumber", "price": 176, "size": "per kg"},
        {"name": "Chicken Wings", "price": 1050, "size": "per kg"},
        {"name": "Chilled Whole Chicken Skinless", "price": 1390, "size": "per kg"},
        {"name": "CIC Half Chicken", "price": 1370, "size": "per kg"},
        {"name": "CIC Skinless Whole Chicken", "price": 1520, "size": "per kg"},
        {"name": "CIC Whole Chicken With Giblet", "price": 1350, "size": "per kg"},
        {"name": "Bairaha Pre Cut Chicken Skinless",
            "price": 1500, "size": "per kg"},
        {"name": "Bairaha Whole Chicken", "price": 1350, "size": "per kg"},
        {"name": "Bairaha Whole Chicken Skinless", "price": 1360, "size": "per kg"},
        {"name": "Chicken Boneless Thigh", "price": 2250, "size": "per kg"},
        {"name": "Chicken Breast Boneless", "price": 2250, "size": "per kg"},
        {"name": "Chicken Drumsticks Skin On", "price": 1450, "size": "per kg"},
        {"name": "Chicken Drumsticks Skinless", "price": 1690, "size": "per kg"},
        {"name": "Chicken Full Breast Skinless", "price": 1780, "size": "per kg"},
        {"name": "Chicken Gizzard", "price": 1190, "size": "per kg"},
        {"name": "Chicken Liver", "price": 1090, "size": "per kg"},
        {"name": "Chicken Neck", "price": 990, "size": "per kg"},
        {"name": "Chicken Thigh Skin On", "price": 1590, "size": "per kg"},
        {"name": "Chicken Thigh Skinless", "price": 1790, "size": "per kg"},
        {"name": "Chicken Whole Legs Skin On", "price": 1450, "size": "per kg"},
        {"name": "Chicken Whole Legs Skinless", "price": 1750, "size": "per kg"},
        {"name": "Chicken Winglets", "price": 1430, "size": "per kg"},
        {"name": "Curry Leaves", "price": 440, "size": "per kg"},
        {"name": "Egg Plant", "price": 760, "size": "per kg"},
        {"name": "Gotukola (Chopped)", "price": 180, "size": "per unit"},
        {"name": "Mukunuwenna (Chopped)", "price": 180, "size": "per unit"},
        {"name": "Garlic", "price": 850, "size": "per kg"},
        {"name": "Ginger", "price": 1200, "size": "per kg"},
        {"name": "Button Mushroom", "price": 595, "size": "per unit"},
        {"name": "Green Beans", "price": 690, "size": "per kg"},
        {"name": "Green Chilies", "price": 880, "size": "per kg"},
        {"name": "Green Cucumber", "price": 390, "size": "per kg"},
        {"name": "Iceberg Lettuce", "price": 1450, "size": "per kg"},
        {"name": "Knolkhol", "price": 290, "size": "per kg"},
        {"name": "Kohila", "price": 520, "size": "per kg"},
        {"name": "Ladies Fingers", "price": 270, "size": "per kg"},
        {"name": "Batavia Lettuce", "price": 460, "size": "per unit"}
    ]

    # Generate the flattened structure
    final_rag_dataset = generate_rag_documents(cargills_raw, keells_raw)

    # Save directly to the output file for Member 2
    output_filename = "chroma_ready.json"
    with open(output_filename, "w") as f:
        json.dump(final_rag_dataset, f, indent=2)

    print(
        f"✅ Success! {len(final_rag_dataset)} items processed and saved to '{output_filename}'")
