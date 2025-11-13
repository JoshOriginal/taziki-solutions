document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('blogGrid');
  if (!grid) return;

  fetch('/api/blogs/published')
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        grid.innerHTML = '<p class="text-gray-400">Failed to load posts.</p>';
        return;
      }

      const blogs = data.blogs || [];
      if (blogs.length === 0) {
        grid.innerHTML = '<p class="text-gray-400">No posts yet. Please check back later.</p>';
        return;
      }

      grid.innerHTML = blogs.map(blog => {
        const img = blog.image || '/images/blog-default.jpg';
        const category = blog.category || 'General';
        const date = new Date(blog.dateCreated).toLocaleDateString();
        const excerpt = blog.excerpt || (blog.content || '').replace(/<[^>]+>/g, '').slice(0, 160) + '...';
        const slug = blog.slug || (blog.title || '').toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');

        return `
          <div class="blog-card bg-dark-light/30 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/30 shadow-lg">
            <div class="relative h-48 overflow-hidden">
              <img src="${img}" alt="${escapeHtml(blog.title)}" class="w-full h-full object-cover" loading="lazy">
              <div class="absolute top-4 left-4">
                <span class="px-3 py-1 bg-primary/90 text-white text-xs font-bold rounded-full">${escapeHtml(category)}</span>
              </div>
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold mb-3 hover:text-primary transition-colors">
                <a href="/blog/${slug}.html">${escapeHtml(blog.title)}</a>
              </h3>
              <p class="text-gray-300 mb-4 line-clamp-3">
                ${escapeHtml(excerpt)}
              </p>
              <div class="flex justify-between items-center">
                <div class="flex items-center space-x-2 text-sm text-gray-400">
                  <i class="far fa-calendar"></i>
                  <span>${escapeHtml(date)}</span>
                </div>
                <a href="/blog/${slug}.html" class="text-primary hover:underline font-medium">Read More</a>
              </div>
            </div>
          </div>
        `;
      }).join('\n');
    })
    .catch(err => {
      console.error('Error loading blogs:', err);
      grid.innerHTML = '<p class="text-gray-400">Error loading posts.</p>';
    });

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
});