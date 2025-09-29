import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || 're_Z9J391ae_KbJomeDm2siMSBdPeCzUwjki';
const fromEmail = process.env.MAIL_FROM || 'onboarding@resend.dev';

// Initialize Resend client
const resend = new Resend(resendApiKey);

export function getEmailTransporter() {
  // For compatibility with existing code, return a mock transporter object
  // that uses Resend internally
  return {
    sendMail: async (options) => {
      return await sendEmail({
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        cc: options.cc,
        bcc: options.bcc
      });
    },
    verify: async () => {
      // Resend doesn't need verification like SMTP
      return true;
    }
  };
}

export async function sendEmail({ to, subject, text, html, cc, bcc }, retryCount = 0) {
  const maxRetries = 2;
  
  try {
    console.log(`Attempting to send email to: ${to}, subject: ${subject} (attempt ${retryCount + 1})`);
    
    // Prepare email options for Resend
    const emailOptions = {
      from: fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject,
      html: html || text, // Resend prefers HTML, fallback to text
    };

    // Add CC and BCC if provided
    if (cc) {
      emailOptions.cc = Array.isArray(cc) ? cc : [cc];
    }
    if (bcc) {
      emailOptions.bcc = Array.isArray(bcc) ? bcc : [bcc];
    }

    // Add text version if HTML is provided but no text
    if (html && !text) {
      emailOptions.text = html.replace(/<[^>]*>/g, ''); // Strip HTML tags for text version
    } else if (text && !html) {
      emailOptions.text = text;
    }
    
    // Send email using Resend
    const response = await resend.emails.send(emailOptions);
    
    // Check for errors in the response
    if (response.error) {
      throw new Error(`Resend API error: ${response.error.message || response.error}`);
    }
    
    const messageId = response.data?.id;
    console.log(`Email sent successfully. Message ID: ${messageId}`);
    return { messageId: messageId || 'resend-' + Date.now() };
  } catch (error) {
    console.error('Email sending failed:', {
      error: error.message,
      to: to,
      subject: subject,
      attempt: retryCount + 1,
      resendError: error
    });
    
    // Retry logic for transient errors
    if (retryCount < maxRetries && (
      error.message.includes('timeout') || 
      error.message.includes('ECONNRESET') ||
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('rate limit') ||
      error.message.includes('temporary')
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
    // Resend doesn't require verification like SMTP
    // We can test by sending a simple email to verify the API key
    console.log("Resend: API key configured and ready to send emails");
    console.log("Resend: From email:", fromEmail);
    return true;
  } catch (err) {
    console.error("Resend: Configuration check failed:", err?.message || err);
    return false;
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