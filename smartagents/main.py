import sys

from agents.supervisor_agent import run_supervisor_pipeline
from profiles import default_for, remember_meal_preferences, sign_in


if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")


def _read_number(prompt, default, cast):
    value = input(f"{prompt} [{default}]: ").strip()
    if not value:
        return default
    return cast(value)


def _read_text(prompt, default):
    value = input(f"{prompt} [{default}]: ").strip()
    return value or default


def _read_user_input(profile):
    print("\nEnter household details for the agent pipeline. Type Ctrl+C to exit.\n")
    pantry_default = ", ".join(default_for(profile, "pantry_items", []))
    family_size = _read_number("Family size", default_for(profile, "family_size", 4), int)
    budget = _read_number("Budget in LKR", default_for(profile, "budget", 15000), float)
    diet_preference = _read_text("Diet preference", default_for(profile, "diet_preference", "No Preference"))
    pantry_text = _read_text("Pantry items, comma separated", pantry_default)
    location = _read_text("Location", default_for(profile, "location", "Colombo"))

    return {
        "family_size": family_size,
        "budget": budget,
        "diet_preference": diet_preference,
        "pantry_items": [item.strip() for item in pantry_text.split(",") if item.strip()],
        "location": location,
    }


def main():
    profile = sign_in()
    account = profile["account"]
    print(f"\nSigned in as {account['name']} <{account['email']}>.")
    if profile.get("preferences"):
        print("Loaded your saved meal preferences as today's defaults.")

    while True:
        try:
            user_input = _read_user_input(profile)
        except (EOFError, KeyboardInterrupt):
            print("\nExiting.")
            break
        except ValueError:
            print("\nPlease enter valid numbers for family size and budget.")
            continue

        result = run_supervisor_pipeline(user_input)
        remember_meal_preferences(profile, user_input, result)
        print("\n" + result["response"])
        print("\nSaved these preferences to your profile memory.")

        again = input("\nGenerate another plan? [y/N]: ").strip().lower()
        if again != "y":
            break


if __name__ == "__main__":
    main()
