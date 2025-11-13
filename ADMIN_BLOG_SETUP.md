# 📚 Admin Blog Management System - Setup Guide

## 🎉 What You Now Have

Your Taziki Solutions website now has a complete admin dashboard for managing blog posts without touching code! Here's what's included:

### ✅ Features

- **Admin Dashboard** - Overview of all blog posts with statistics
- **Blog Management** - Create, edit, delete, and publish blog posts
- **Rich HTML Editor** - Format blog content with built-in HTML tools
- **Featured Blogs** - Mark blogs as featured for homepage display
- **Draft Mode** - Write and save posts before publishing
- **Auto HTML Generation** - Published blogs automatically get their own HTML files
- **Secure Login** - Admin authentication with session management
- **Search & Filter** - Organize blogs by status and category
- **Responsive Design** - Works on desktop and mobile

---

## 🚀 Quick Start

### Step 1: Update `.env` File

Make sure your `.env` file has the required admin credentials:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=info@tazikisolutions.com
PORT=3000

# Add these NEW admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=taziki2025
```

**IMPORTANT**: Change the default admin password in production!

### Step 2: Start the Server

```powershell
npm start
# or
node server.js
```

You should see:
```
✅ Server running on http://localhost:3000
📧 Contact form endpoint: POST http://localhost:3000/contact
🔐 Admin dashboard: http://localhost:3000/admin/dashboard.html
📝 Blog API: http://localhost:3000/api/blogs/published
```

### Step 3: Access Admin Dashboard

1. Open: **http://localhost:3000/admin/dashboard.html**
2. Login with:
   - Username: `admin`
   - Password: `taziki2025` (or your custom password)

---

## 📝 Creating a Blog Post

### Via Admin Dashboard

1. Click **"Create Blog"** button
2. Fill in:
   - **Title** - Blog post title (required)
   - **Category** - Choose from predefined categories
   - **Excerpt** - Short summary (auto-generated if empty)
   - **Featured Image URL** - Direct link to image
   - **Author** - Your name or team name
   - **Content** - Write or paste HTML content
   - **Status** - Draft or Published

3. Click **"Create Blog"** to save

### Content Formatting

Use the quick formatting buttons:
- **H2/H3** - Headings
- **P** - Paragraph
- **Bold** - Strong emphasis
- **List** - Bullet or numbered lists
- **Link** - Add hyperlinks
- **Image** - Embed images

Or write raw HTML:
```html
<h2>Main Heading</h2>
<p>This is a paragraph.</p>
<ul>
  <li>List item 1</li>
  <li>List item 2</li>
</ul>
<strong>Bold text</strong>
```

### Publishing

Choose status when creating:
- **Draft** - Saved but not visible on site
- **Published** - Automatically generates HTML file and becomes visible

---

## 📂 File Structure

```
taziki-solutions/
├── server.js                    # Main server file (UPDATED)
├── admin-auth.js               # NEW: Admin authentication
├── blog-db.js                  # NEW: Blog database functions
├── blog-routes.js              # NEW: Blog API routes
├── blogs.json                  # NEW: Blog database (auto-created)
│
├── admin/
│   └── dashboard.html          # NEW: Admin panel interface
│
├── blog/
│   ├── index.html              # Blog listing page
│   ├── smart-buildings.html    # Individual blog posts
│   ├── web-development-trends.html
│   ├── app-development-guide.html
│   ├── [slug].html             # NEW: Auto-generated blog files
│   └── ...
│
└── ... (other files)
```

---

## 🔌 API Endpoints

### Admin Endpoints (Require Authentication)

#### Login
```
POST /admin/login
Body: { "username": "admin", "password": "taziki2025" }
Response: { "success": true, "token": "xxx..." }
```

#### Get All Blogs (Admin View)
```
GET /admin/blogs
Header: Authorization: Bearer {token}
```

#### Get Single Blog
```
GET /admin/blogs/{id}
Header: Authorization: Bearer {token}
```

#### Create Blog
```
POST /admin/blogs
Header: Authorization: Bearer {token}
Body: {
  "title": "My Blog",
  "category": "Web Development",
  "content": "<h2>Introduction</h2>...",
  "status": "published"
}
```

#### Update Blog
```
PUT /admin/blogs/{id}
Header: Authorization: Bearer {token}
Body: { same as create }
```

#### Delete Blog
```
DELETE /admin/blogs/{id}
Header: Authorization: Bearer {token}
```

#### Logout
```
POST /admin/logout
Header: Authorization: Bearer {token}
```

### Public API Endpoints

#### Get Published Blogs
```
GET /api/blogs/published
Response: { "success": true, "blogs": [...] }
```

#### Get Featured Blogs
```
GET /api/blogs/featured?limit=3
Response: { "success": true, "blogs": [...] }
```

#### Search Blogs
```
GET /api/blogs/search?q=keyword
Response: { "success": true, "blogs": [...] }
```

---

## 🔐 Security & Admin Credentials

### Changing Admin Password

Edit `.env` file:
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-new-secure-password
```

Then restart the server.

### Best Practices

1. **Never commit `.env` file** to Git (already in `.gitignore`)
2. **Use strong passwords** for production
3. **Use HTTPS** when deployed (Vercel does this by default)
4. **Sessions expire after 24 hours** - user must login again
5. **Clear browser cache** if having login issues

---

## 🗄️ Database Format

Blogs are stored in `blogs.json`:

```json
{
  "blogs": [
    {
      "id": "blog_1234567890_abc123xyz",
      "title": "The Future of Smart Buildings",
      "slug": "the-future-of-smart-buildings",
      "category": "Technology Trends",
      "excerpt": "Discover how integrated smart building technologies...",
      "content": "<h2>Introduction</h2>...",
      "image": "/images/blog-smart-buildings.jpg",
      "author": "Taziki Solutions",
      "featured": true,
      "status": "published",
      "dateCreated": "2025-06-12T10:30:00.000Z",
      "dateUpdated": "2025-06-12T10:30:00.000Z"
    },
    ...
  ],
  "lastUpdated": "2025-11-13T14:45:00.000Z"
}
```

### Blog Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (auto-generated) |
| `title` | string | Blog post title |
| `slug` | string | URL-friendly version of title (auto-generated) |
| `category` | string | Blog category for organization |
| `excerpt` | string | Short summary for previews |
| `content` | string | Full HTML content |
| `image` | string | Featured image URL |
| `author` | string | Author name |
| `featured` | boolean | Show on homepage |
| `status` | string | "draft" or "published" |
| `dateCreated` | string | ISO timestamp |
| `dateUpdated` | string | ISO timestamp |

---

## 🚢 Deploying to Vercel

### Step 1: Prepare Files

Ensure all files are committed to Git:
```powershell
git add .
git commit -m "Add admin blog management system"
git push origin main
```

### Step 2: Deploy to Vercel

```powershell
npm install -g vercel
vercel
```

### Step 3: Configure Environment Variables

On Vercel Dashboard:
1. Go to Settings → Environment Variables
2. Add:
   - `EMAIL_USER`
   - `EMAIL_PASSWORD`
   - `ADMIN_EMAIL`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `PORT` (optional, defaults to 3000)

### Step 4: Configure Vercel Deployment

Create `vercel.json` in project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

### Step 5: Redeploy

```powershell
vercel --prod
```

Your admin dashboard will be at: `https://your-domain.vercel.app/admin/dashboard.html`

---

## 🐛 Troubleshooting

### Issue: "Invalid username or password"
**Solution:** Check `.env` file has correct `ADMIN_USERNAME` and `ADMIN_PASSWORD`

### Issue: Server won't start
**Solution:** 
```powershell
npm install express nodemailer dotenv cors body-parser
node server.js
```

### Issue: Can't access admin dashboard
**Solution:**
1. Make sure server is running: `node server.js`
2. Clear browser cache: `Ctrl+Shift+Delete`
3. Check browser console for errors: `F12`

### Issue: Blog HTML files not being created
**Solution:**
1. Make sure `blog/` folder exists
2. Check status is set to "published"
3. Verify write permissions on `blog/` folder

### Issue: Blogs not appearing on site
**Solution:**
1. Make sure status is "published" (not "draft")
2. Check `blogs.json` file contains the data
3. Verify blog list page queries the API: `/api/blogs/published`

### Issue: Can't find session token
**Solution:**
1. Login again
2. Check browser localStorage: Open DevTools → Application → LocalStorage
3. Clear localStorage if corrupted: `localStorage.clear()` in console

---

## 📊 Dashboard Statistics

The dashboard shows:
- **Total Blogs** - All blog posts (draft + published)
- **Published** - Blogs visible on site
- **Drafts** - Work-in-progress blogs
- **Recent Posts** - Last 5 blogs created/updated

---

## 🎯 Next Steps

1. **Create your first blog** via admin dashboard
2. **Preview** by navigating to the blog page
3. **Test on staging** before deploying
4. **Deploy to Vercel** using steps above
5. **Update home page** to showcase featured blogs using the API

---

## 📚 Additional Resources

- **Express.js Docs**: https://expressjs.com/
- **Node.js Docs**: https://nodejs.org/en/docs/
- **Vercel Docs**: https://vercel.com/docs
- **SQLite3 (optional database upgrade)**: https://www.sqlite.org/

---

## 🎉 You're All Set!

Your admin blog management system is ready to use. Start creating amazing content!

**Questions?** Check the troubleshooting section or review the API endpoints documentation.
