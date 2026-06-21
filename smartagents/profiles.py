import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None


BASE_DIR = Path(__file__).resolve().parent
PROFILE_DIR = BASE_DIR / "user_profiles"
GOOGLE_SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
]


def _utc_now():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _profile_id(email):
    return hashlib.sha256(email.lower().encode("utf-8")).hexdigest()[:16]


def _profile_path(email):
    return PROFILE_DIR / f"{_profile_id(email)}.json"


def _google_config():
    secrets_file = os.getenv("GOOGLE_CLIENT_SECRETS_FILE", "").strip()
    if secrets_file:
        path = Path(secrets_file).expanduser()
        if not path.is_absolute():
            path = BASE_DIR / path
        if not path.exists():
            raise RuntimeError(f"Google OAuth secrets file was not found: {path}")
        return {"kind": "file", "value": path}

    client_id = os.getenv("GOOGLE_CLIENT_ID", "").strip()
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "").strip()
    if client_id and client_secret:
        return {
            "kind": "config",
            "value": {
                "installed": {
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": ["http://localhost"],
                }
            },
        }

    return None


def _sign_in_with_google(config):
    try:
        import requests
        from google_auth_oauthlib.flow import InstalledAppFlow
    except ImportError as exc:
        raise RuntimeError(
            "Google sign-in needs google-auth-oauthlib and requests. "
            "Install the project requirements, then try again."
        ) from exc

    if config["kind"] == "file":
        flow = InstalledAppFlow.from_client_secrets_file(str(config["value"]), GOOGLE_SCOPES)
    else:
        flow = InstalledAppFlow.from_client_config(config["value"], GOOGLE_SCOPES)

    credentials = flow.run_local_server(port=0, prompt="select_account")
    response = requests.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={"Authorization": f"Bearer {credentials.token}"},
        timeout=10,
    )
    response.raise_for_status()
    userinfo = response.json()

    return {
        "email": userinfo["email"],
        "name": userinfo.get("name") or userinfo["email"],
        "picture": userinfo.get("picture"),
        "auth_provider": "google",
    }


def _sign_in_for_development():
    print(
        "\nGoogle OAuth is not configured yet. "
        "Using a local development profile so preferences can still be saved."
    )
    email = input("Profile email: ").strip().lower()
    while not email:
        email = input("Profile email is required: ").strip().lower()
    name = input("Display name [Meal Planner User]: ").strip() or "Meal Planner User"
    return {
        "email": email,
        "name": name,
        "picture": None,
        "auth_provider": "local-dev",
    }


def load_profile(account):
    path = _profile_path(account["email"])
    if not path.exists():
        return {
            "account": account,
            "preferences": {},
            "meal_history": [],
            "created_at": _utc_now(),
            "updated_at": _utc_now(),
        }

    with path.open("r", encoding="utf-8") as file:
        profile = json.load(file)

    profile["account"] = {**profile.get("account", {}), **account}
    profile.setdefault("preferences", {})
    profile.setdefault("meal_history", [])
    profile.setdefault("created_at", _utc_now())
    profile["updated_at"] = _utc_now()
    return profile


def save_profile(profile):
    PROFILE_DIR.mkdir(parents=True, exist_ok=True)
    profile["updated_at"] = _utc_now()
    with _profile_path(profile["account"]["email"]).open("w", encoding="utf-8") as file:
        json.dump(profile, file, indent=2)


def sign_in():
    if load_dotenv is not None:
        load_dotenv(BASE_DIR / ".env")
    config = _google_config()
    account = _sign_in_with_google(config) if config else _sign_in_for_development()
    profile = load_profile(account)
    save_profile(profile)
    return profile


def default_for(profile, key, fallback):
    return profile.get("preferences", {}).get(key, fallback)


def remember_meal_preferences(profile, user_input, pipeline_result):
    preferences = profile.setdefault("preferences", {})
    preferences.update(
        {
            "family_size": user_input["family_size"],
            "budget": user_input["budget"],
            "diet_preference": user_input["diet_preference"],
            "pantry_items": user_input["pantry_items"],
            "location": user_input["location"],
        }
    )

    meals = []
    for meal in pipeline_result.get("meal_plan", []):
        meals.append(
            {
                "day": meal["day"],
                "meal": meal["meal"],
                "estimated_cost": meal["estimated_cost"],
                "ingredients": [product.name for product in meal["ingredients"]],
            }
        )

    history = profile.setdefault("meal_history", [])
    history.insert(
        0,
        {
            "created_at": _utc_now(),
            "preferences": dict(preferences),
            "meals": meals,
        },
    )
    del history[10:]
    save_profile(profile)
