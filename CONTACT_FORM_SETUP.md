# Node.js Contact Form Backend Setup Guide

## 📋 Overview
This guide helps you set up a Node.js backend to handle contact form submissions with email notifications.

## ✅ What's Been Done

### 1. **Packages Installed**
- ✅ `express` - Web server framework
- ✅ `nodemailer` - Email sending
- ✅ `dotenv` - Environment variables
- ✅ `cors` - Cross-origin requests
- ✅ `body-parser` - Parse request bodies

### 2. **Files Created**
- ✅ `server.js` - Express backend server
- ✅ `.env` - Environment configuration
- ✅ `contact-handler.js` - Client-side form handler

## 🚀 Getting Started

### Step 1: Configure Email Settings

Edit `.env` file:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=info@tazikisolutions.com
PORT=3000
```

### Step 2: Get Gmail App Password (Recommended)

If using Gmail:
1. Go to: https://myaccount.google.com/security
2. Enable "2-Step Verification"
3. Go to "App passwords" (under 2-Step Verification)
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character password
6. Paste it as `EMAIL_PASSWORD` in `.env`

### Step 3: Update HTML Forms

Add this script to your HTML pages (before closing `</body>` tag):

```html
<!-- Contact Form Handler -->
<script src="contact-handler.js"></script>
```

And update your form `action` attribute:
```html
<form action="/contact" method="POST">
  <!-- form fields -->
</form>
```

Or use this if you want to keep the current structure:
```html
<form action="contact-form.php" method="POST">
  <!-- The script will intercept this automatically -->
</form>
```

### Step 4: Start the Server

```powershell
# Navigate to project directory
cd c:\Users\HomePC\Downloads\taziki-solutions

# Start the server
node server.js
```

You should see:
```
✅ Server running on http://localhost:3000
📧 Contact form endpoint: POST http://localhost:3000/contact
```

### Step 5: Test the Form

1. Open http://localhost:3000 in your browser
2. Fill out a contact form
3. Submit it
4. Check your email for confirmation

## 📧 Email Setup Options

### Gmail (Recommended)
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

### Outlook/Hotmail
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
# Update service in server.js to: service: 'outlook'
```

### Custom SMTP
```env
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASSWORD=your-password
# Update server.js to use:
# host: your-smtp-host
# port: 587
# secure: false
```

## 🔧 Modify server.js for Custom Email Service

If using a custom email service, update the transporter:

```javascript
const transporter = nodemailer.createTransport({
  host: 'your-smtp-host', // e.g., smtp.yourdomain.com
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

## 📱 Client-Side Form Requirements

Your form fields need these `name` attributes:
```html
<input name="name" required />
<input name="email" type="email" required />
<input name="subject" required />
<textarea name="message" required></textarea>
<button type="submit">Send Message</button>
```

The script will automatically:
- Validate all fields
- Validate email format
- Show loading state
- Display success/error messages
- Reset form on success

## 🚢 Deploy to Vercel

### 1. Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    { "src": "server.js", "use": "@vercel/node" },
    { "src": "public/**", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/contact", "dest": "server.js" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### 2. Add Environment Variables to Vercel:
- Go to project settings
- Add `.env` variables
- Deploy

## ✨ Features

✅ Form validation
✅ Email verification
✅ Confirmation emails to users
✅ Admin notification emails
✅ Error handling
✅ CORS support
✅ Responsive alerts

## 🐛 Troubleshooting

### "Cannot find module 'express'"
```powershell
npm install express nodemailer dotenv cors body-parser
```

### "Gmail authentication failed"
- Check 2-Step Verification is enabled
- Use 16-character app password (not regular password)
- Ensure `.env` has no spaces

### "Form not sending"
1. Check server is running: `node server.js`
2. Open browser console for errors
3. Verify form has correct `name` attributes
4. Ensure `contact-handler.js` is loaded

### "CORS error"
- CORS is enabled in server.js
- Check request is coming from correct origin

## 📚 Additional Resources

- Express docs: https://expressjs.com/
- Nodemailer docs: https://nodemailer.com/
- Vercel Node.js: https://vercel.com/docs/concepts/functions/serverless-functions

## 🎯 Next Steps

1. Configure `.env` with your email
2. Add `<script src="contact-handler.js"></script>` to HTML pages
3. Start server: `node server.js`
4. Test the contact form
5. Deploy to Vercel when ready

Happy coding! 🚀
