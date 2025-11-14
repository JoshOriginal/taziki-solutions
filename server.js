const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import admin and blog modules
const { loginAdmin, logoutAdmin, requireAuth } = require('./admin-auth');
const { initializeDB } = require('./blog-db');
const blogRoutes = require('./blog-routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers middleware
app.use((req, res, next) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  next();
});

// Handle preflight requests
app.options('*', (req, res) => {
  res.sendStatus(200);
});

// Force HTTPS in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Initialize database
initializeDB().catch(err => console.error('DB init error:', err));

// Ensure uploads directory exists
const fs = require('fs');
const path = require('path');
const uploadsDir = path.join(__dirname, 'images', 'uploads');
try {
  fs.mkdirSync(uploadsDir, { recursive: true });
} catch (e) {
  console.error('Could not create uploads directory', e);
}

// Multer for image uploads
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.random().toString(36).substr(2, 8);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Improved Email configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false // For Railway environment
  }
});

// Test email connection on startup
transporter.verify(function(error, success) {
  if (error) {
    console.log('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Improved contact form route with better error handling
app.post('/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Enhanced validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ 
      success: false, 
      error: 'All fields are required' 
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Please enter a valid email address' 
    });
  }

  try {
    // Email to admin
    const adminMailOptions = {
      from: `"Taziki Solutions" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `New Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #F97316;">New Contact Form Submission</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #F97316;">
              ${message.replace(/\n/g, '<br>')}
            </p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This message was sent from your website contact form.
          </p>
        </div>
      `
    };

    // Confirmation email to user
    const userMailOptions = {
      from: `"Taziki Solutions" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'We Received Your Message - Taziki Solutions',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #F97316;">Thank You for Contacting Us!</h2>
          <p>Hi ${name},</p>
          <p>We have received your message and will get back to you within 24 hours.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Message Details:</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #16A34A;">
              ${message.replace(/\n/g, '<br>')}
            </p>
          </div>
          
          <div style="border-top: 2px solid #F97316; padding-top: 20px; margin-top: 30px;">
            <p><strong>Taziki Solutions Team</strong></p>
            <p>Email: info@tazikisolutions.com</p>
            <p>Phone: +254 714 294 223</p>
            <p>Nairobi, Kenya</p>
          </div>
        </div>
      `
    };

    // Send both emails with timeout
    const sendEmail = (mailOptions) => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Email timeout'));
        }, 15000); // 15 second timeout

        transporter.sendMail(mailOptions, (error, info) => {
          clearTimeout(timeout);
          if (error) {
            reject(error);
          } else {
            resolve(info);
          }
        });
      });
    };

    await sendEmail(adminMailOptions);
    await sendEmail(userMailOptions);

    console.log('✅ Contact form submission processed successfully');
    res.json({ 
      success: true, 
      message: 'Your message has been sent successfully! We will get back to you soon.' 
    });

  } catch (error) {
    console.error('❌ Email error details:', error);
    
    // More specific error messages
    let errorMessage = 'Failed to send message. Please try again later.';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Email configuration error. Please check your email settings.';
    } else if (error.message === 'Email timeout') {
      errorMessage = 'Email service timeout. Please try again in a few moments.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Cannot connect to email service. Please check your internet connection.';
    }

    res.status(500).json({ 
      success: false, 
      error: errorMessage 
    });
  }
});

// =================== ADMIN ROUTES ===================

// Image upload (admin only)
app.post('/admin/upload-image', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const publicPath = `/images/uploads/${req.file.filename}`;
  res.json({ success: true, url: publicPath });
});

// Admin login
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username and password are required' 
    });
  }
  
  const token = loginAdmin(username, password);
  
  if (token) {
    res.json({ 
      success: true, 
      message: 'Login successful',
      token 
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid username or password' 
    });
  }
});


// Admin logout
app.post('/admin/logout', requireAuth, (req, res) => {
  logoutAdmin(req.adminToken);
  res.json({ 
      success: true, 
      message: 'Logged out successfully' 
  });
});

// =================== BLOG ROUTES ===================
app.use(blogRoutes);

// Serve static files (after API routes)
app.use(express.static('.'));

// Test email connection on startup
transporter.verify(function(error, success) {
  if (error) {
    console.log('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// DEBUG ROUTE - Add this to check email configuration
app.get('/debug-email', (req, res) => {
  const emailConfig = {
    EMAIL_USER: process.env.EMAIL_USER ? '✅ Set' : '❌ Not Set',
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? '✅ Set (' + process.env.EMAIL_PASSWORD.substring(0, 4) + '...)' : '❌ Not Set', 
    ADMIN_EMAIL: process.env.ADMIN_EMAIL ? '✅ Set' : '❌ Not Set',
    NODE_ENV: process.env.NODE_ENV || '❌ Not Set',
    email_service: 'Gmail SMTP',
    status: 'Debug endpoint active'
  };
  
  console.log('📧 Email Configuration Debug:');
  console.log('- EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'NOT SET');
  console.log('- EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set' : 'NOT SET');
  console.log('- ADMIN_EMAIL:', process.env.ADMIN_EMAIL ? 'Set' : 'NOT SET');
  
  res.json(emailConfig);
});

// Test email route - try sending a test email
app.get('/test-email', async (req, res) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return res.json({ 
        success: false, 
        error: 'Email credentials not configured',
        EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Not Set',
        EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'Set' : 'Not Set'
      });
    }

    const testMailOptions = {
      from: `"Taziki Test" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: 'Test Email from Taziki Solutions',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email from your Taziki Solutions website.</p>
        <p>If you received this, your email configuration is working!</p>
        <p>Time sent: ${new Date().toString()}</p>
      `
    };

    await transporter.sendMail(testMailOptions);
    res.json({ 
      success: true, 
      message: 'Test email sent successfully! Check your inbox.' 
    });
    
  } catch (error) {
    console.error('Test email error:', error);
    res.json({ 
      success: false, 
      error: error.message,
      code: error.code 
    });
  }
});

// Test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📧 Contact form endpoint: POST http://localhost:${PORT}/contact`);
  console.log(`🔐 Admin dashboard: http://localhost:${PORT}/admin/dashboard.html`);
  console.log(`📝 Blog API: http://localhost:${PORT}/api/blogs/published`);
});