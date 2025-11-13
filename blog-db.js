const fs = require('fs').promises;
const path = require('path');

// Database file path
const DB_FILE = path.join(__dirname, 'blogs.json');

// Initialize database
async function initializeDB() {
  try {
    await fs.access(DB_FILE);
  } catch {
    // Create initial database file if it doesn't exist
    await fs.writeFile(DB_FILE, JSON.stringify({
      blogs: [],
      lastUpdated: new Date().toISOString()
    }, null, 2));
  }
}

// Read all blogs
async function getAllBlogs() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data).blogs;
  } catch (error) {
    console.error('Error reading blogs:', error);
    return [];
  }
}

// Read single blog by ID
async function getBlogById(id) {
  const blogs = await getAllBlogs();
  return blogs.find(blog => blog.id === id);
}

// Create new blog
async function createBlog(blogData) {
  const blogs = await getAllBlogs();
  
  const newBlog = {
    id: generateBlogId(),
    title: blogData.title,
    slug: generateSlug(blogData.title),
    category: blogData.category,
    excerpt: blogData.excerpt,
    content: blogData.content,
    featured: blogData.featured || false,
    image: blogData.image || '/images/blog-default.jpg',
    author: blogData.author || 'Taziki Solutions',
    dateCreated: new Date().toISOString(),
    dateUpdated: new Date().toISOString(),
    status: blogData.status || 'draft' // draft or published
  };
  
  blogs.push(newBlog);
  await saveBlogs(blogs);
  
  return newBlog;
}

// Update blog
async function updateBlog(id, blogData) {
  const blogs = await getAllBlogs();
  const index = blogs.findIndex(blog => blog.id === id);
  
  if (index === -1) {
    throw new Error('Blog not found');
  }
  
  blogs[index] = {
    ...blogs[index],
    ...blogData,
    id, // Keep original ID
    slug: generateSlug(blogData.title || blogs[index].title), // Update slug if title changed
    dateUpdated: new Date().toISOString()
  };
  
  await saveBlogs(blogs);
  return blogs[index];
}

// Delete blog
async function deleteBlog(id) {
  const blogs = await getAllBlogs();
  const filtered = blogs.filter(blog => blog.id !== id);
  
  if (filtered.length === blogs.length) {
    throw new Error('Blog not found');
  }
  
  await saveBlogs(filtered);
  return true;
}

// Save blogs to file
async function saveBlogs(blogs) {
  try {
    await fs.writeFile(DB_FILE, JSON.stringify({
      blogs,
      lastUpdated: new Date().toISOString()
    }, null, 2));
  } catch (error) {
    console.error('Error saving blogs:', error);
    throw error;
  }
}

// Helper functions
function generateBlogId() {
  return 'blog_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Get published blogs only
async function getPublishedBlogs() {
  const blogs = await getAllBlogs();
  return blogs.filter(blog => blog.status === 'published').sort((a, b) => 
    new Date(b.dateCreated) - new Date(a.dateCreated)
  );
}

// Get featured blogs
async function getFeaturedBlogs(limit = 3) {
  const blogs = await getPublishedBlogs();
  return blogs.filter(blog => blog.featured).slice(0, limit);
}

// Search blogs
async function searchBlogs(query) {
  const blogs = await getAllBlogs();
  const q = query.toLowerCase();
  
  return blogs.filter(blog =>
    blog.title.toLowerCase().includes(q) ||
    blog.excerpt.toLowerCase().includes(q) ||
    blog.content.toLowerCase().includes(q) ||
    blog.category.toLowerCase().includes(q)
  );
}

module.exports = {
  initializeDB,
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getPublishedBlogs,
  getFeaturedBlogs,
  searchBlogs,
  generateSlug
};
