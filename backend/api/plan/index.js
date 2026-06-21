const express = require("express");
const router = express.Router();
const orchestrator = require("../../orchestrator");
const emailAuth = require("../../services/email-auth");
const profileMemory = require("../../services/profile-memory");

router.get("/plan", (req, res) => {
  res.json({ message: "GrocerMind API is running. Please send a POST request to this endpoint with your payload." });
});

router.post("/plan", async (req, res) => {
  try {
    const userInput = req.body;
    const result = await orchestrator.orchestratePlan(userInput);
    res.json(result);
  } catch (error) {
    console.error("Orchestrator pipeline failed:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/profile", (req, res) => {
  const profile = profileMemory.loadProfile(req.query.email);

  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  res.json(profile);
});

router.post("/profile", (req, res) => {
  const profile = profileMemory.saveProfile(req.body);

  if (!profile) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  res.json(profile);
});

router.post("/auth/request-code", async (req, res) => {
  try {
    const result = await emailAuth.sendVerificationCode(req.body.email);
    res.json({ message: "Verification email sent.", ...result });
  } catch (error) {
    console.error("Could not send verification email:", error);
    res.status(error.statusCode || 500).json({
      error: error.statusCode ? error.message : "Could not send verification email.",
    });
  }
});

router.post("/auth/verify-code", (req, res) => {
  const result = emailAuth.verifyCode(req.body.email, req.body.code);

  if (!result.verified) {
    res.status(400).json({ error: result.reason });
    return;
  }

  res.json({ verified: true, email: result.email });
});

module.exports = router;
