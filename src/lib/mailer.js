import nodemailer from "nodemailer";

const ADMIN_EMAIL = "mis.admin@parasoffset.com";

function getTransporter() {
  const rawHost = process.env.EMAIL_SERVER_HOST;
  if (!rawHost || !process.env.EMAIL_SERVER_USER) {
    // No real SMTP configured – we'll just log the OTP in sendOtpEmail.
    console.warn(
      "EMAIL_SERVER_* env vars not set; OTP will be logged to the server console instead of emailed."
    );
    return null;
  }

  // If someone accidentally puts an email address as host, fall back to Gmail SMTP.
  const host =
    rawHost && rawHost.includes("@") ? "smtp.gmail.com" : rawHost;

  const transport = {
    host,
    port: Number(process.env.EMAIL_SERVER_PORT || 587),
    secure: false,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASS,
    },
  };

  return nodemailer.createTransport(transport);
}

export async function sendOtpEmail({ otp, forEmail }) {
  const transporter = getTransporter();

  // Always log OTP in dev so you can proceed even if email delivery fails.
  console.log(
    `[DEV OTP] New signup for ${forEmail}. OTP (share with user): ${otp}`
  );

  if (!transporter) {
    return;
  }

  try {
    const info = await transporter.sendMail({
      from:
        process.env.EMAIL_FROM ||
        `"Paras Offset SaaS" <${process.env.EMAIL_SERVER_USER}>`,
      to: ADMIN_EMAIL,
      subject: "New User Signup OTP Verification",
      text: `A new user is trying to sign up.\n\nEmail: ${forEmail}\nOTP: ${otp}\n\nShare this OTP with the user to complete verification.`,
      html: `<p>A new user is trying to sign up.</p>
        <p><strong>Email:</strong> ${forEmail}</p>
        <p><strong>OTP:</strong> <code>${otp}</code></p>
        <p>Share this OTP with the user to complete verification.</p>`,
    });
    return info;
  } catch (err) {
    console.error("Error sending OTP email:", err);
    // Still let signup flow continue since OTP is logged above.
    return;
  }
}

