import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM;

class Mail {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      host: host,
      port: 465,
      secure: true,
      auth: {
        user,
        pass,
      },
    });
  }

  static getInstance() {
    if (!Mail.instance) {
      Mail.instance = new Mail();
    }
    return Mail.instance;
  }

  async sendMail({ to, subject, template }) {
    return new Promise((resolve, reject) => {
      this.transporter.sendMail(
        {
          from: {
            name: "AJK Innovation Incubator Foundation",
            address: from,
          },
          to: to,
          subject: subject,
          html: template,
        },
        (error, info) => {
          if (error) {
            console.error('Email sending error:', error);
            reject(error);
          } else {
            console.log('Email sent successfully:', info.response);
            resolve(true);
          }
        }
      );
    });
  }
}

// Email template function
function getEmailTemplate({ firstName, email, phoneNumber, message }) {
  const timestamp = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Registration - AIIF</title>
    <style>
        /* Reset styles for email clients */
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }
        
        /* Main styles */
        body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: #f8fafc;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #4e73ff 0%, #3b5bdb 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
            letter-spacing: -0.5px;
        }
        
        .header p {
            margin: 8px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .registration-badge {
            display: inline-block;
            background-color: #e0f2fe;
            color: #0369a1;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 24px;
        }
        
        .field-group {
            margin-bottom: 24px;
            border-left: 4px solid #4e73ff;
            padding-left: 16px;
        }
        
        .field-label {
            font-size: 14px;
            font-weight: 600;
            color: #344054;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .field-value {
            font-size: 16px;
            color: #1f2937;
            line-height: 1.5;
            word-break: break-word;
        }
        
        .message-field {
            background-color: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
            margin-top: 8px;
        }
        
        .organization-info {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 12px;
            padding: 24px;
            margin-top: 32px;
            border: 1px solid #e5e7eb;
        }
        
        .org-title {
            font-size: 18px;
            font-weight: 700;
            color: #4e73ff;
            margin-bottom: 16px;
            text-align: center;
        }
        
        .contact-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-top: 16px;
        }
        
        .contact-item {
            text-align: center;
        }
        
        .contact-label {
            font-size: 12px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        
        .contact-value {
            font-size: 14px;
            color: #374151;
            font-weight: 500;
        }
        
        .contact-link {
            color: #4e73ff;
            text-decoration: none;
        }
        
        .footer {
            background-color: #1f2937;
            color: #9ca3af;
            padding: 24px 30px;
            text-align: center;
            font-size: 14px;
        }
        
        .timestamp {
            font-size: 12px;
            color: #6b7280;
            margin-top: 16px;
            text-align: center;
            font-style: italic;
        }
        
        /* Mobile responsive */
        @media only screen and (max-width: 600px) {
            .email-container {
                margin: 0 10px;
            }
            
            .header, .content {
                padding: 24px 20px;
            }
            
            .contact-grid {
                grid-template-columns: 1fr;
                gap: 12px;
            }
            
            .header h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>New Registration Received</h1>
            <p>AJK Innovation Incubator Foundation</p>
        </div>
        
        <!-- Content -->
        <div class="content">
            <div class="registration-badge">
                📋 Registration Form Submission
            </div>
            
            <!-- Form Fields -->
            <div class="field-group">
                <div class="field-label">First Name</div>
                <div class="field-value">${firstName}</div>
            </div>
            
            <div class="field-group">
                <div class="field-label">Email Address</div>
                <div class="field-value">
                    <a href="mailto:${email}" class="contact-link">${email}</a>
                </div>
            </div>
            
            <div class="field-group">
                <div class="field-label">Phone Number</div>
                <div class="field-value">
                    <a href="tel:${phoneNumber}" class="contact-link">${phoneNumber}</a>
                </div>
            </div>
            
            <div class="field-group">
                <div class="field-label">Message</div>
                <div class="field-value">
                    <div class="message-field">${message}</div>
                </div>
            </div>
            
            <!-- Organization Information -->
            <div class="organization-info">
                <div class="org-title">AJK Innovation Incubator Foundation (AIIF)</div>
                
                <div class="contact-grid">
                    <div class="contact-item">
                        <div class="contact-label">Phone</div>
                        <div class="contact-value">
                            <a href="tel:+918925889316" class="contact-link">+91-8925889316</a>
                        </div>
                    </div>
                    
                    <div class="contact-item">
                        <div class="contact-label">Email</div>
                        <div class="contact-value">
                            <a href="mailto:info@aiif.in" class="contact-link">info@aiif.in</a>
                        </div>
                    </div>
                    
                    <div class="contact-item">
                        <div class="contact-label">Website</div>
                        <div class="contact-value">
                            <a href="https://www.ajkcas.ac.in/aiif" class="contact-link">www.ajkcas.ac.in/aiif</a>
                        </div>
                    </div>
                    
                    <div class="contact-item">
                        <div class="contact-label">Location</div>
                        <div class="contact-value">AJK College of Arts and Science, Navakkarai, Coimbatore</div>
                    </div>
                </div>
            </div>
            
            <div class="timestamp">
                Received on ${timestamp}
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p>This email was generated automatically from your website's registration form.</p>
            <p>© 2025 AJK Innovation Incubator Foundation. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `;
}

export async function POST(request) {
  try {
    const { firstName, email, phoneNumber, message } = await request.json();

    // Validate required fields
    if (!firstName || !email || !phoneNumber || !message) {
      return Response.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get mail instance
    const mailInstance = Mail.getInstance();
    
    // Generate email template
    const template = getEmailTemplate({ firstName, email, phoneNumber, message });
    
    // Send email to admin
    const adminEmail = process.env.SMTP_FROM || 'info@aiif.in';
    await mailInstance.sendMail({
      to: adminEmail,
      subject: `New Contact Form Submission from ${firstName}`,
      template
    });

    return Response.json(
      { message: 'Contact form submitted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form submission error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}