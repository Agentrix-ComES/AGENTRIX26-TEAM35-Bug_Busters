const fs = require("fs");
const path = require("path");

const PROFILE_PATH = path.join(__dirname, "../../data/user-profiles.json");

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function readProfiles() {
  if (!fs.existsSync(PROFILE_PATH)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(PROFILE_PATH, "utf8"));
  } catch (error) {
    console.error("Could not read user profile memory:", error);
    return {};
  }
}

function writeProfiles(profiles) {
  fs.writeFileSync(PROFILE_PATH, `${JSON.stringify(profiles, null, 2)}\n`);
}

function budgetRangeFromBudget(budget) {
  const amount = Number(budget);

  if (!Number.isFinite(amount) || amount <= 0) {
    return "";
  }

  if (amount <= 10000) {
    return "0-10000";
  }

  if (amount <= 15000) {
    return "10000-15000";
  }

  if (amount <= 20000) {
    return "15000-20000";
  }

  return "20000+";
}

function budgetFromRange(range) {
  const value = String(range || "");
  const upperBound = value.match(/-(\d+)/);

  if (upperBound) {
    return Number(upperBound[1]);
  }

  const lowerBound = value.match(/^(\d+)\+/);
  return lowerBound ? Number(lowerBound[1]) : 15000;
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function mergeProfileData(existing = {}, updates = {}) {
  const now = new Date().toISOString();
  const email = normalizeEmail(updates.email || existing.email);

  return {
    ...existing,
    ...updates,
    email,
    name: updates.name || existing.name || "",
    picture: updates.picture || existing.picture || "",
    familySize: Number(updates.familySize || existing.familySize) || 1,
    dietPreference: updates.dietPreference || existing.dietPreference || "No Preference",
    preferredMeals: normalizeList(updates.preferredMeals ?? existing.preferredMeals),
    favoriteCuisines: normalizeList(updates.favoriteCuisines ?? existing.favoriteCuisines),
    dislikedIngredients: normalizeList(updates.dislikedIngredients ?? existing.dislikedIngredients),
    allergies: normalizeList(updates.allergies ?? existing.allergies),
    cookingTime: updates.cookingTime || existing.cookingTime || "30 minutes",
    cookingSkill: updates.cookingSkill || existing.cookingSkill || "Intermediate",
    mealGoal: updates.mealGoal || existing.mealGoal || "Save money",
    budgetRange: updates.budgetRange || existing.budgetRange || budgetRangeFromBudget(updates.budget),
    location: updates.location || existing.location || "Colombo",
    onboarded: Boolean(updates.onboarded ?? existing.onboarded),
    updatedAt: now,
    createdAt: existing.createdAt || now,
  };
}

function loadProfile(email) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return null;
  }

  return readProfiles()[normalizedEmail] || null;
}

function mergeWithProfile(userInput = {}) {
  const email = normalizeEmail(userInput.email);
  const profile = loadProfile(email);
  const preferredMeals = normalizeList(
    userInput.preferredMeals?.length ? userInput.preferredMeals : profile?.preferredMeals,
  );
  const dislikedIngredients = normalizeList(
    userInput.dislikedIngredients?.length ? userInput.dislikedIngredients : profile?.dislikedIngredients,
  );
  const allergies = normalizeList(userInput.allergies?.length ? userInput.allergies : profile?.allergies);
  const budget = Number(userInput.budget) || budgetFromRange(userInput.budgetRange || profile?.budgetRange);

  return {
    email,
    name: userInput.name || profile?.name || "",
    picture: userInput.picture || profile?.picture || "",
    familySize: Math.max(Number(userInput.familySize || profile?.familySize) || 1, 1),
    budget,
    budgetRange: userInput.budgetRange || profile?.budgetRange || budgetRangeFromBudget(budget),
    dietPreference: userInput.dietPreference || profile?.dietPreference || "No Preference",
    pantryItems: normalizeList(userInput.pantryItems),
    preferredMeals,
    favoriteCuisines: normalizeList(userInput.favoriteCuisines?.length ? userInput.favoriteCuisines : profile?.favoriteCuisines),
    dislikedIngredients,
    allergies,
    cookingTime: userInput.cookingTime || profile?.cookingTime || "30 minutes",
    cookingSkill: userInput.cookingSkill || profile?.cookingSkill || "Intermediate",
    mealGoal: userInput.mealGoal || profile?.mealGoal || "Save money",
    location: userInput.location || profile?.location || "Colombo",
    profileLoaded: Boolean(profile),
  };
}

function saveProfile(userInput = {}) {
  const email = normalizeEmail(userInput.email);

  if (!email) {
    return null;
  }

  const profiles = readProfiles();
  const profile = mergeProfileData(profiles[email], userInput);

  profiles[email] = profile;
  writeProfiles(profiles);

  return profile;
}

module.exports = {
  budgetRangeFromBudget,
  loadProfile,
  mergeWithProfile,
  saveProfile,
};
