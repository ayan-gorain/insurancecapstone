import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

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
    console.warn("No SMTP configured. Emails will be logged to console.");
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
    // Gmail specific settings
    transporterConfig.auth = {
      user: smtpUser,
      pass: smtpPass,
    };
    transporterConfig.tls = {
      rejectUnauthorized: false
    };
  }

  transporter = nodemailer.createTransport(transporterConfig);

  return transporter;
}

export async function sendEmail({ to, subject, text, html, cc, bcc }, retryCount = 0) {
  const maxRetries = 2;
  
  try {
    const tr = getEmailTransporter();
    console.log(`Attempting to send email via SMTP to: ${to}, subject: ${subject} (attempt ${retryCount + 1})`);
    
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
    
    console.log(`Email sent successfully via SMTP. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email sending failed via SMTP:', {
      error: error.message,
      code: error.code,
      response: error.response,
      responseCode: error.responseCode,
      command: error.command,
      to: to,
      subject: subject,
      attempt: retryCount + 1,
      smtpConfig: {
        host: smtpHost,
        port: smtpPort,
        user: smtpUser ? 'Set' : 'Missing',
        pass: smtpPass ? 'Set' : 'Missing'
      }
    });
    
    // Retry logic for transient errors
    const shouldRetry = retryCount < maxRetries && (
      error.message.includes('timeout') || 
      error.message.includes('ECONNRESET') ||
      error.message.includes('ETIMEDOUT') ||
      error.code === 'ECONNREFUSED'
    );
    
    if (shouldRetry) {
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
    console.error("SMTP: Verification failed:", err?.message || err);
  }
}

export function buildWelcomeEmail({ name }) {
  const subject = "Welcome to LifeShield - Your Account is Ready!";
  const text = `Hi ${name},\n\nWelcome to LifeShield! Your account has been created successfully.\n\nRegards,\nLifeShield Team`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to LifeShield</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">🛡️ LifeShield</h1>
          <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">Your Trusted Insurance Partner</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Welcome to LifeShield!</h2>
          
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Hi <strong style="color: #2d3748;">${name}</strong>,
          </p>
          
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            Welcome to <strong style="color: #667eea;">LifeShield</strong>! We're thrilled to have you join our family of protected customers. Your account has been created successfully and you're now ready to explore our comprehensive insurance solutions.
          </p>
          
          <!-- Features Box -->
          <div style="background-color: #f7fafc; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px;">What's Next?</h3>
            <ul style="color: #4a5568; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Browse our comprehensive insurance policies</li>
              <li>Get instant quotes and compare coverage options</li>
              <li>Purchase policies with secure payment processing</li>
              <li>Manage your policies from your dashboard</li>
            </ul>
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Explore Our Policies
            </a>
          </div>
          
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
            If you have any questions, our support team is here to help you 24/7.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #2d3748; padding: 30px; text-align: center;">
          <p style="color: #a0aec0; margin: 0 0 10px 0; font-size: 14px;">
            <strong style="color: #ffffff;">LifeShield Insurance</strong>
          </p>
          <p style="color: #a0aec0; margin: 0; font-size: 12px;">
            Protecting what matters most to you
          </p>
          <div style="margin-top: 20px;">
            <a href="#" style="color: #a0aec0; text-decoration: none; margin: 0 10px; font-size: 12px;">Privacy Policy</a>
            <a href="#" style="color: #a0aec0; text-decoration: none; margin: 0 10px; font-size: 12px;">Terms of Service</a>
            <a href="#" style="color: #a0aec0; text-decoration: none; margin: 0 10px; font-size: 12px;">Contact Us</a>
          </div>
        </div>
        
      </div>
    </body>
    </html>
  `;
  
  return { subject, text, html };
}

export function buildPolicyPurchaseEmail({ name, policyTitle, startDate, endDate, premium, reference }) {
  const subject = "🎉 Policy Purchase Confirmed - LifeShield Insurance";
  const text = `Hi ${name},\n\nThank you for your purchase!\n\nPolicy Details:\nPolicy: ${policyTitle}\nStart Date: ${new Date(startDate).toDateString()}\nEnd Date: ${new Date(endDate).toDateString()}\nPremium: ₹${premium}\nPayment Reference: ${reference}\n\nYour policy is now active and you're protected!\n\nRegards,\nLifeShield Team`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Policy Purchase Confirmed</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
          <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 40px;">✅</span>
          </div>
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Policy Purchase Confirmed!</h1>
          <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">You're now protected with LifeShield</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Thank You for Your Purchase!</h2>
          
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Hi <strong style="color: #2d3748;">${name}</strong>,
          </p>
          
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            Congratulations! Your insurance policy has been successfully purchased and is now active. You can rest assured knowing that you and your loved ones are protected.
          </p>
          
          <!-- Policy Details Card -->
          <div style="background-color: #f7fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 30px 0;">
            <h3 style="color: #2d3748; margin: 0 0 20px 0; font-size: 20px; text-align: center;">📋 Policy Details</h3>
            
            <div style="display: grid; gap: 15px;">
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #4a5568; font-weight: 600;">Policy Name:</span>
                <span style="color: #2d3748; font-weight: 600;">${policyTitle}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #4a5568; font-weight: 600;">Start Date:</span>
                <span style="color: #2d3748;">${new Date(startDate).toLocaleDateString('en-IN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #4a5568; font-weight: 600;">End Date:</span>
                <span style="color: #2d3748;">${new Date(endDate).toLocaleDateString('en-IN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #4a5568; font-weight: 600;">Premium Amount:</span>
                <span style="color: #10b981; font-weight: 700; font-size: 18px;">₹${premium.toLocaleString('en-IN')}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
                <span style="color: #4a5568; font-weight: 600;">Payment Reference:</span>
                <span style="color: #2d3748; font-family: monospace; background-color: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${reference}</span>
              </div>
            </div>
          </div>
          
          <!-- Status Badge -->
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background-color: #d1fae5; color: #065f46; padding: 10px 20px; border-radius: 20px; font-weight: 600; font-size: 14px;">
              🟢 Policy Status: ACTIVE
            </div>
          </div>
          
          <!-- Important Info -->
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">📌 Important Information</h4>
            <ul style="color: #92400e; margin: 0; padding-left: 20px; line-height: 1.6; font-size: 14px;">
              <li>Your policy is now active and provides immediate coverage</li>
              <li>Keep this email as proof of purchase</li>
              <li>You can view your policy details in your dashboard</li>
              <li>Contact us immediately if you need to make a claim</li>
            </ul>
          </div>
          
          <!-- CTA Buttons -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 15px 25px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 0 10px;">
              View Policy Details
            </a>
            <a href="#" style="display: inline-block; background-color: #ffffff; color: #10b981; text-decoration: none; padding: 15px 25px; border: 2px solid #10b981; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 0 10px;">
              Download Certificate
            </a>
          </div>
          
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
            If you have any questions about your policy or need assistance, our customer support team is available 24/7.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #2d3748; padding: 30px; text-align: center;">
          <p style="color: #a0aec0; margin: 0 0 10px 0; font-size: 14px;">
            <strong style="color: #ffffff;">LifeShield Insurance</strong>
          </p>
          <p style="color: #a0aec0; margin: 0; font-size: 12px;">
            Protecting what matters most to you
          </p>
          <div style="margin-top: 20px;">
            <a href="#" style="color: #a0aec0; text-decoration: none; margin: 0 10px; font-size: 12px;">Privacy Policy</a>
            <a href="#" style="color: #a0aec0; text-decoration: none; margin: 0 10px; font-size: 12px;">Terms of Service</a>
            <a href="#" style="color: #a0aec0; text-decoration: none; margin: 0 10px; font-size: 12px;">Contact Us</a>
          </div>
        </div>
        
      </div>
    </body>
    </html>
  `;
  
  return { subject, text, html };
}

// Removed admin/agent email builders to keep it simple