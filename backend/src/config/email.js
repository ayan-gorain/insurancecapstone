import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.MAIL_FROM || smtpUser;

// Email service configurations

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
    console.warn("No email service configured. Emails will be logged to console.");
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

  // Enhanced configuration for better reliability
  const transporterConfig = {
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    },
    connectionTimeout: 600000, // 10 minutes
    greetingTimeout: 300000,   // 5 minutes
    socketTimeout: 600000,     // 10 minutes
    pool: false, // Disable pooling for better reliability
    maxConnections: 1,
    maxMessages: 1,
    rateDelta: 10000,
    rateLimit: 1,
    // Additional options for better compatibility
    ignoreTLS: false,
    requireTLS: true,
    debug: process.env.NODE_ENV === 'development'
  };

  // Special handling for Gmail
  if (smtpHost && smtpHost.includes('gmail.com')) {
    transporterConfig.service = 'gmail';
    delete transporterConfig.host;
    delete transporterConfig.port;
    delete transporterConfig.secure;
  }

  transporter = nodemailer.createTransport(transporterConfig);

  return transporter;
}

export async function sendEmail({ to, subject, text, html, cc, bcc }, retryCount = 0) {
  const maxRetries = 2;
  
  try {
    const tr = getEmailTransporter();
    console.log(`Attempting to send email to: ${to}, subject: ${subject} (attempt ${retryCount + 1})`);
    
    // Add timeout wrapper for email sending
    const emailPromise = tr.sendMail({
      from: fromEmail,
      to,
      cc,
      bcc,
      subject,
      text,
      html,
    });
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email sending timeout after 10 minutes')), 600000);
    });
    
    const info = await Promise.race([emailPromise, timeoutPromise]);
    
    console.log(`Email sent successfully. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email sending failed:', {
      error: error.message,
      code: error.code,
      to: to,
      subject: subject,
      attempt: retryCount + 1
    });
    
    // Retry logic for transient errors
    if (retryCount < maxRetries && (
      error.message.includes('timeout') || 
      error.message.includes('ECONNRESET') ||
      error.message.includes('ETIMEDOUT') ||
      error.code === 'ECONNREFUSED'
    )) {
      console.log(`Retrying email send in 2 seconds... (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return sendEmail({ to, subject, text, html, cc, bcc }, retryCount + 1);
    }
    
    // Don't throw error in production to prevent app crashes
    // Just log the failure and continue
    if (process.env.NODE_ENV === 'production') {
      console.log('Email sending failed but continuing execution in production mode');
      return { messageId: 'failed-' + Date.now() };
    }
    
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


//dd