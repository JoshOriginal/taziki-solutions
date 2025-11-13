# ✅ Node.js Contact Form Backend - Setup Complete!

## 🚀 Server Status
Your server is now running on: **http://localhost:3000**

## 📋 What's Been Set Up

### Files Created:
1. ✅ **server.js** - Express backend server with email functionality
2. ✅ **contact-handler.js** - Client-side form submission handler
3. ✅ **.env** - Environment configuration (UPDATE THIS!)
4. ✅ **package.json** - Project dependencies and scripts
5. ✅ **.gitignore** - Protects sensitive files
6. ✅ **CONTACT_FORM_SETUP.md** - Detailed setup guide

### Packages Installed:
- express (web server)
- nodemailer (email sending)
- dotenv (environment variables)
- cors (cross-origin requests)
- body-parser (request parsing)

## 🔧 Quick Setup

### Step 1: Configure Email (.env file)
Edit the `.env` file in your project root:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=info@tazikisolutions.com
PORT=3000
```

**For Gmail:**
1. Enable 2-Step Verification: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Paste the 16-char password in `.env`

### Step 2: Add Script to HTML Files
Add this line before the closing `</body>` tag in your HTML:

```html
<script src="contact-handler.js"></script>
```

Update your form action to:
```html
<form action="/contact" method="POST">
  <input name="name" required />
  <input name="email" type="email" required />
  <input name="subject" required />
  <textarea name="message" required></textarea>
  <button type="submit">Send Message</button>
</form>
```

### Step 3: Start Server
```powershell
npm start
# or
node server.js
```

## ✨ Features Included

✅ Form validation (client-side)
✅ Email validation
✅ Automatic confirmation emails to users
✅ Admin notification emails
✅ Error handling & user feedback
✅ CORS enabled
✅ Success/error alerts
✅ Form reset on success

## 📧 Email Flow

1. User fills form → Client validation
2. Form submitted to `/contact` endpoint
3. Server sends 2 emails:
   - ✉️ Admin notification (to you)
   - ✉️ User confirmation (to their email)
4. User sees success message

## 🔗 API Endpoint

**POST** `/contact`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Service Inquiry",
  "message": "I'm interested in your services..."
}
```

## 🧪 Test the Server

1. Make sure server is running: `node server.js`
2. Visit: http://localhost:3000
3. Fill out a contact form
4. Submit and check your email

## 🚢 Deploy to Vercel

### Easy Deploy:
```powershell
npm install -g vercel
vercel
```

### Manual Deploy:
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables (`.env` values)
4. Deploy

## 📚 File Locations

```
taziki-solutions/
├── server.js                    (← Backend server)
├── contact-handler.js           (← Client-side handler)
├── .env                         (← CONFIG (keep secret!))
├── package.json                 (← Dependencies)
├── .gitignore                   (← Ignore sensitive files)
├── CONTACT_FORM_SETUP.md        (← Detailed guide)
└── index.html, etc...           (← Your HTML files)
```

## 🎯 Next Steps

1. **Configure .env** with your email settings
2. **Add script** to your HTML pages
3. **Test locally** - fill out a form
4. **Deploy to Vercel** when ready
5. **Update .env variables** on Vercel dashboard

## 🆘 Troubleshooting

### Server won't start?
```powershell
npm install express nodemailer dotenv cors body-parser
node server.js
```

### Gmail not working?
- ✅ Use 16-char App Password (not your regular password)
- ✅ Enable 2-Step Verification
- ✅ Check no spaces in .env

### Form not submitting?
- ✅ Add `<script src="contact-handler.js"></script>` to HTML
- ✅ Form fields must have correct `name` attributes
- ✅ Check browser console for errors
- ✅ Server must be running

### Environment Variables Not Loading?
```powershell
# Make sure .env is in project root
dir .env
# Should show: .env
```

## 📞 Support Resources

- Express: https://expressjs.com/
- Nodemailer: https://nodemailer.com/
- Vercel: https://vercel.com/docs

---

**Your contact form is now powered by Node.js! 🎉**

Any questions? Refer to `CONTACT_FORM_SETUP.md` for detailed instructions.
