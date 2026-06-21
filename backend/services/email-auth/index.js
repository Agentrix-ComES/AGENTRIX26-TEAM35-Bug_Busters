const crypto = require("crypto");
const nodemailer = require("nodemailer");

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const pendingCodes = new Map();

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isGoogleEmail(email) {
  return /@(gmail|googlemail)\.com$/.test(normalizeEmail(email));
}

function hashCode(email, code) {
  return crypto
    .createHash("sha256")
    .update(`${normalizeEmail(email)}:${code}:${process.env.AUTH_CODE_SECRET || "dev-auth-secret"}`)
    .digest("hex");
}

function createTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("SMTP_USER and SMTP_APP_PASSWORD must be configured.");
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true") === "true",
    auth: { user, pass },
  });
}

async function sendVerificationCode(email) {
  const normalizedEmail = normalizeEmail(email);

  if (!isGoogleEmail(normalizedEmail)) {
    const error = new Error("Use a Gmail or Googlemail address.");
    error.statusCode = 400;
    throw error;
  }

  const code = String(crypto.randomInt(100000, 1000000));
  pendingCodes.set(normalizedEmail, {
    codeHash: hashCode(normalizedEmail, code),
    expiresAt: Date.now() + CODE_TTL_MS,
    attempts: 0,
  });

  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"GrocerMind AI" <${process.env.SMTP_USER}>`,
    to: normalizedEmail,
    subject: "Your GrocerMind AI login code",
    text: `Your GrocerMind AI verification code is ${code}. It expires in 10 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>GrocerMind AI login</h2>
        <p>Your verification code is:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:4px">${code}</p>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  });

  return { email: normalizedEmail, expiresInMinutes: 10 };
}

function verifyCode(email, code) {
  const normalizedEmail = normalizeEmail(email);
  const pending = pendingCodes.get(normalizedEmail);

  if (!pending) {
    return { verified: false, reason: "No verification code found." };
  }

  if (Date.now() > pending.expiresAt) {
    pendingCodes.delete(normalizedEmail);
    return { verified: false, reason: "Verification code expired." };
  }

  if (pending.attempts >= MAX_ATTEMPTS) {
    pendingCodes.delete(normalizedEmail);
    return { verified: false, reason: "Too many verification attempts." };
  }

  pending.attempts += 1;

  if (pending.codeHash !== hashCode(normalizedEmail, String(code || "").trim())) {
    return { verified: false, reason: "Invalid verification code." };
  }

  pendingCodes.delete(normalizedEmail);
  return { verified: true, email: normalizedEmail };
}

module.exports = {
  isGoogleEmail,
  sendVerificationCode,
  verifyCode,
};
