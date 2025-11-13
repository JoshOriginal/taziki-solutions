const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { requireAuth } = require('./admin-auth');
const { 
  getAllBlogs, 
  getBlogById, 
  createBlog, 
  updateBlog, 
  deleteBlog,
  getPublishedBlogs,
  getFeaturedBlogs,
  searchBlogs 
} = require('./blog-db');

const router = express.Router();

// GET all blogs (admin view - requires auth)
router.get('/admin/blogs', requireAuth, async (req, res) => {
  try {
    const blogs = await getAllBlogs();
    res.json({
      success: true,
      blogs,
      total: blogs.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single blog (admin view - requires auth)
router.get('/admin/blogs/:id', requireAuth, async (req, res) => {
  try {
    const blog = await getBlogById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET published blogs (public API)
router.get('/api/blogs/published', async (req, res) => {
  try {
    const blogs = await getPublishedBlogs();
    res.json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET featured blogs (public API)
router.get('/api/blogs/featured', async (req, res) => {
  try {
    const limit = req.query.limit || 3;
    const blogs = await getFeaturedBlogs(parseInt(limit));
    res.json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// SEARCH blogs
router.get('/api/blogs/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query required' });
    }
    const blogs = await searchBlogs(query);
    res.json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// CREATE new blog (requires auth)
router.post('/admin/blogs', requireAuth, async (req, res) => {
  try {
    const { title, category, excerpt, content, featured, image, author, status } = req.body;
    
    // Validation
    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and content are required' 
      });
    }
    
    const blog = await createBlog({
      title,
      category: category || 'General',
      excerpt: excerpt || content.substring(0, 200),
      content,
      featured: featured || false,
      image: image || '/images/blog-default.jpg',
      author: author || 'Taziki Solutions',
      status: status || 'draft'
    });
    
    // Generate HTML file if published
    if (status === 'published') {
      await generateBlogHTML(blog);
    }
    
    res.json({ success: true, message: 'Blog created successfully', blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE blog (requires auth)
router.put('/admin/blogs/:id', requireAuth, async (req, res) => {
  try {
    const { title, category, excerpt, content, featured, image, author, status } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and content are required' 
      });
    }
    
    const blog = await updateBlog(req.params.id, {
      title,
      category: category || 'General',
      excerpt: excerpt || content.substring(0, 200),
      content,
      featured: featured || false,
      image: image || '/images/blog-default.jpg',
      author: author || 'Taziki Solutions',
      status: status || 'draft'
    });
    
    // Generate or remove HTML file based on status
    if (status === 'published') {
      await generateBlogHTML(blog);
    } else {
      // Try to delete HTML file if unpublishing
      try {
        await fs.unlink(path.join(__dirname, 'blog', `${blog.slug}.html`));
      } catch (e) {
        // File might not exist
      }
    }
    
    res.json({ success: true, message: 'Blog updated successfully', blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE blog (requires auth)
router.delete('/admin/blogs/:id', requireAuth, async (req, res) => {
  try {
    const blog = await getBlogById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    
    await deleteBlog(req.params.id);
    
    // Delete HTML file if exists
    try {
      await fs.unlink(path.join(__dirname, 'blog', `${blog.slug}.html`));
    } catch (e) {
      // File might not exist
    }
    
    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper function to generate blog HTML file
async function generateBlogHTML(blog) {
  const blogDir = path.join(__dirname, 'blog');
  
  // Ensure blog directory exists
  try {
    await fs.mkdir(blogDir, { recursive: true });
  } catch (e) {
    console.error('Error creating blog directory:', e);
  }
  
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${blog.title} | Blog | Taziki Solutions</title>
  <meta name="description" content="${blog.excerpt}">
  <meta name="keywords" content="${blog.category}, blog, Taziki Solutions">
  
  <!-- Favicons -->
  <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png">
  <link rel="icon" type="image/x-icon" href="/images/favicon.ico">
  
  <!-- Preconnect for external resources -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://cdnjs.cloudflare.com">
  
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" media="print" onload="this.media='all'">
  
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
  
  <!-- Vercel Analytics -->
  <script>
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  </script>
  <script defer src="/_vercel/insights/script.js"></script>
  <script defer src="https://cdn.vercel-analytics.com/v1/speed-insights.js"></script>
  
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '#F97316',
            secondary: '#16A34A',
            dark: '#0f172a',
            'dark-light': '#1e293b',
            'dark-lighter': '#334155'
          },
          fontFamily: {
            'sans': ['Inter', 'sans-serif'],
            'poppins': ['Poppins', 'sans-serif']
          }
        }
      }
    }
  </script>
  
  <style>
    html {
      scroll-behavior: smooth;
    }
    
    body {
      background-color: #0f172a;
      color: #fff;
      font-family: 'Inter', sans-serif;
      overflow-x: hidden;
    }
    
    .gradient-bg {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    }
    
    .navbar-fixed {
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    
    .prose h2 {
      color: #fff;
      font-size: 1.875rem;
      font-weight: 700;
      margin-top: 2rem;
      margin-bottom: 1rem;
    }
    
    .prose h3 {
      color: #fff;
      font-size: 1.5rem;
      font-weight: 600;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
    }
    
    .prose p {
      color: #d1d5db;
      margin-bottom: 1rem;
      line-height: 1.7;
    }
    
    .prose ul, .prose ol {
      color: #d1d5db;
      margin-bottom: 1rem;
      padding-left: 1.5rem;
    }
    
    .prose li {
      margin-bottom: 0.5rem;
      line-height: 1.7;
    }
    
    .prose strong {
      color: #fff;
      font-weight: 600;
    }
    
    .prose a {
      color: #F97316;
      text-decoration: underline;
    }
    
    .prose a:hover {
      color: #fb923c;
    }
  </style>
</head>
<body class="font-sans">
  <!-- Header/Navigation -->
  <header x-data="{ open: false }" class="fixed top-0 left-0 w-full z-50 navbar-fixed bg-dark/80 border-b border-dark-lighter/30">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex-shrink-0 flex items-center">
          <a href="../index.html" class="text-2xl md:text-3xl font-bold font-poppins">
            <span class="text-primary">Taziki</span><span class="text-white">Solutions</span>
          </a>
        </div>
        
        <nav class="hidden md:ml-auto md:flex md:items-center md:space-x-6">
          <a href="../index.html" class="navbar-link text-white hover:text-primary px-2 py-1 text-sm">Home</a>
          <a href="index.html" class="navbar-link text-white hover:text-primary px-2 py-1 text-sm">Blog</a>
          <a href="../faq.html" class="navbar-link text-white hover:text-primary px-2 py-1 text-sm">FAQ</a>
        </nav>
        
        <div class="-mr-2 flex items-center md:hidden">
          <button @click="open = !open" class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-dark-lighter focus:outline-none">
            <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path :class="{'hidden': open, 'inline-flex': !open }" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path :class="{'inline-flex': open, 'hidden': !open }" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Blog Post -->
  <article class="pt-32 pb-20 gradient-bg">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto">
        <!-- Header -->
        <div class="mb-12">
          <div class="inline-block mb-4">
            <span class="px-3 py-1 bg-primary/90 text-white text-xs font-bold rounded-full">${blog.category}</span>
          </div>
          
          <h1 class="text-4xl md:text-5xl font-bold font-poppins mb-6">${blog.title}</h1>
          
          <div class="flex items-center space-x-6 text-gray-400 mb-8">
            <div class="flex items-center space-x-2">
              <i class="far fa-calendar"></i>
              <span>${new Date(blog.dateCreated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="flex items-center space-x-2">
              <i class="far fa-user"></i>
              <span>${blog.author}</span>
            </div>
          </div>
          
          <img src="${blog.image}" alt="${blog.title}" class="w-full h-96 object-cover rounded-xl mb-12">
        </div>
        
        <!-- Content -->
        <div class="prose max-w-none mb-12">
          ${blog.content}
        </div>
        
        <!-- Footer -->
        <div class="border-t border-gray-700/30 pt-8 mt-12">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p class="text-gray-400 mb-2">Share this article:</p>
              <div class="flex space-x-4">
                <a href="https://twitter.com/intent/tweet?text=${blog.title}" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary/80 transition-colors">
                  <i class="fab fa-twitter fa-lg"></i>
                </a>
                <a href="https://www.linkedin.com/sharing/share-offsite/?url=${blog.slug}" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary/80 transition-colors">
                  <i class="fab fa-linkedin-in fa-lg"></i>
                </a>
                <a href="https://www.facebook.com/sharer/sharer.php?u=${blog.slug}" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary/80 transition-colors">
                  <i class="fab fa-facebook-f fa-lg"></i>
                </a>
              </div>
            </div>
            
            <a href="index.html" class="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
              <span>← Back to Blog</span>
              <i class="fas fa-arrow-left"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  </article>

  <!-- Footer -->
  <footer class="pt-20 pb-10 gradient-bg">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="border-t border-gray-700/50 pt-10">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div class="space-y-4">
            <h3 class="text-xl font-bold font-poppins">Taziki Solutions</h3>
            <p class="text-gray-300 text-sm">Empowering businesses through integrated technology solutions.</p>
          </div>
          <div class="space-y-4">
            <h3 class="font-semibold">Quick Links</h3>
            <ul class="space-y-2">
              <li><a href="../index.html" class="text-gray-300 hover:text-primary text-sm">Home</a></li>
              <li><a href="index.html" class="text-gray-300 hover:text-primary text-sm">Blog</a></li>
              <li><a href="../faq.html" class="text-gray-300 hover:text-primary text-sm">FAQ</a></li>
            </ul>
          </div>
          <div class="space-y-4">
            <h3 class="font-semibold">Services</h3>
            <ul class="space-y-2">
              <li><a href="../website-development.html" class="text-gray-300 hover:text-primary text-sm">Web Development</a></li>
              <li><a href="../app-development.html" class="text-gray-300 hover:text-primary text-sm">App Development</a></li>
              <li><a href="../network-cabling.html" class="text-gray-300 hover:text-primary text-sm">Network Cabling</a></li>
            </ul>
          </div>
          <div class="space-y-4">
            <h3 class="font-semibold">Connect With Us</h3>
            <div class="flex space-x-4">
              <a href="https://x.com/TazikiSolutions" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary/80"><i class="fab fa-twitter"></i></a>
              <a href="https://www.linkedin.com/company/taziki-solutions/" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary/80"><i class="fab fa-linkedin-in"></i></a>
              <a href="https://www.instagram.com/taziki_solutions/" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary/80"><i class="fab fa-instagram"></i></a>
            </div>
          </div>
        </div>
        
        <div class="text-center text-gray-500 text-sm pt-8 border-t border-gray-700/30">
          <p>&copy; 2025 Taziki Solutions. All rights reserved.</p>
        </div>
      </div>
    </div>
  </footer>
  
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script>
    // Convert markdown content to HTML if needed
    const content = document.querySelector('.prose');
    if (content) {
      // Content is already in HTML format from backend
    }
  </script>
</body>
</html>`;

  const filePath = path.join(blogDir, `${blog.slug}.html`);
  await fs.writeFile(filePath, htmlContent, 'utf8');
  console.log(`Blog HTML generated: ${filePath}`);
}

module.exports = router;
