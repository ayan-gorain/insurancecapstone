import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.MAIL_FROM || smtpUser;

let transporter = null;

export function getEmailTransporter() {
  if (transporter) return transporter;

  console.log("Email Config Check:", {
    smtpHost: smtpHost ? "✓ Set" : "✗ Missing",
    smtpPort: smtpPort,
    smtpUser: smtpUser ? "✓ Set" : "✗ Missing", 
    smtpPass: smtpPass ? "✓ Set" : "✗ Missing",
    fromEmail: fromEmail
  });

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn("SMTP not fully configured. Emails will be logged to console.");
    transporter = {
      sendMail: async (options) => {
        console.log("[DEV EMAIL] To:", options.to);
        if (options.cc) console.log("[DEV EMAIL] Cc:", options.cc);
        if (options.bcc) console.log("[DEV EMAIL] Bcc:", options.bcc);
        console.log("[DEV EMAIL] Subject:", options.subject);
        console.log("[DEV EMAIL] Text:", options.text);
        console.log("[DEV EMAIL] HTML:", options.html);
        return { messageId: "dev-logger" };
      },
    };
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  return transporter;
}

export async function sendEmail({ to, subject, text, html, cc, bcc }) {
  try {
    const tr = getEmailTransporter();
    console.log(`Attempting to send email to: ${to}, subject: ${subject}`);
    
    const info = await tr.sendMail({
      from: fromEmail,
      to,
      cc,
      bcc,
      subject,
      text,
      html,
    });
    
    console.log(`Email sent successfully. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email sending failed:', {
      error: error.message,
      code: error.code,
      to: to,
      subject: subject
    });
    throw error;
  }
}

export async function verifyEmailTransporter() {
  try {
    const tr = getEmailTransporter();
    if (typeof tr.verify === "function") {
      await tr.verify();
      console.log("SMTP: Transporter verified and ready to send emails");
    } else {
      console.log("SMTP: Dev logger mode active (no SMTP configured). Emails will be logged.");
    }
  } catch (err) {
    console.error("SMTP: Transporter verification failed:", err?.message || err);
  }
}

export function buildWelcomeEmail({ name }) {
  const subject = "Welcome to LifeShield";
  const text = `Hi ${name},\n\nWelcome to LifeShield! Your account has been created successfully.\n\nRegards,\nLifeShield`;
  const html = `<p>Hi <strong>${name}</strong>,</p>
  <p>Welcome to <strong>LifeShield</strong>! Your account has been created successfully.</p>
  <p>Regards,<br/>LifeShield</p>`;
  return { subject, text, html };
}

export function buildPolicyPurchaseEmail({ name, policyTitle, startDate, endDate, premium, reference }) {
  const subject = "Your policy purchase is confirmed";
  const text = `Hi ${name},\n\nThank you for your purchase.\nPolicy: ${policyTitle}\nStart: ${new Date(startDate).toDateString()}\nEnd: ${new Date(endDate).toDateString()}\nPremium: ${premium}\nPayment Reference: ${reference}\n\nRegards,\nCapstone Insurance`;
  const html = `<p>Hi <strong>${name}</strong>,</p>
  <p>Thank you for your purchase.</p>
  <ul>
    <li><strong>Policy:</strong> ${policyTitle}</li>
    <li><strong>Start:</strong> ${new Date(startDate).toDateString()}</li>
    <li><strong>End:</strong> ${new Date(endDate).toDateString()}</li>
    <li><strong>Premium:</strong> ${premium}</li>
    <li><strong>Payment Reference:</strong> ${reference}</li>
  </ul>
  <p>Regards,<br/>LifeShield</p>`;
  return { subject, text, html };
}

// Removed admin/agent email builders to keep it simple


