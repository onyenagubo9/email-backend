require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const app = express();
app.use(express.json());

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Main page to check if backend is running
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head><title>Backend Status</title></head>
      <body style="font-family: Arial; text-align: center; padding: 50px;">
        <h1>✅ Backend is running!</h1>
        <p>You can now test the /send-login-email API.</p>
      </body>
    </html>
  `);
});

// Login email route
app.post("/send-login-email", async (req, res) => {
  const { to, name } = req.body;

  if (!to) return res.status(400).json({ error: "Missing recipient email" });

  const safeName = name || "Friend";

  const html = `
    <html>
      <body style="font-family: Arial; margin:0; padding:0; background:#f4f5f7;">
        <p>Hi ${safeName},</p>
        <p>We noticed a successful login to your account.</p>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject: "You signed in — Welcome back!",
      html,
    });
    res.json({ ok: true, message: `Login email sent to ${to}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running at http://0.0.0.0:${PORT}`)
);
