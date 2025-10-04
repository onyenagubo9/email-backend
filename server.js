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
      <head>
        <title>Backend Status</title>
      </head>
      <body style="font-family: Arial; text-align: center; padding: 50px;">
        <h1>✅ Backend is running!</h1>
        <p>You can now test the /send-login-email API.</p>
      </body>
    </html>
  `);
});

// Health check
app.get("/", (req, res) => res.send({ ok: true }));

// Login email route
app.post("/send-login-email", async (req, res) => {
  const { to, name } = req.body;

  if (!to) return res.status(400).json({ error: "Missing recipient email" });

  const safeName = name || "Friend";

  // Styled HTML email
  const html = `
  <!doctype html>
  <html>
    <head><meta charset="utf-8" /></head>
    <body style="font-family: Arial, sans-serif; margin:0; padding:0; background:#f4f5f7;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr><td align="center" style="padding:24px 0;">
          <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.08)">
            <tr>
              <td style="background:#0ea5a4;padding:28px;text-align:center;color:#fff;">
                <img src="https://placehold.co/120x120?text=Logo" alt="Logo" width="80" style="display:block;margin:0 auto 8px;" />
                <h1 style="margin:0;font-size:20px">Welcome back, ${safeName}!</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;color:#333;line-height:1.5;">
                <p>Hi ${safeName},</p>
                <p>We noticed a successful login to your account. If this was you, no action is needed — enjoy 👋</p>
                <p>If you didn't sign in, <a href="https://yourapp.com/reset-password">reset your password</a> immediately.</p>
                <div style="margin-top:20px;">
                  <a href="https://yourapp.com" style="display:inline-block;padding:12px 20px;background:#0ea5a4;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Open My App</a>
                </div>
              </td>
            </tr>
            <tr>
              <td style="background:#f2f4f6;padding:14px;text-align:center;color:#7f8a93;font-size:12px;">
                © ${new Date().getFullYear()} My App. You are receiving this because you have an account with us.
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
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
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
