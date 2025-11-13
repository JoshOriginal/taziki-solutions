document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;

  fetch('/api/blogs/featured?limit=3')
    .then(r => r.json())
    .then(data => {
      if (!data.success) {
        grid.innerHTML = '<p class="text-gray-400">Failed to load featured posts.</p>';
        return;
      }

      const posts = data.blogs || [];
      if (posts.length === 0) {
        grid.innerHTML = '<p class="text-gray-400">No featured posts yet.</p>';
        return;
      }

      grid.innerHTML = posts.map(post => {
        const img = post.image || '/images/blog-default.jpg';
        const slug = post.slug;
        const title = escapeHtml(post.title);
        const excerpt = (post.excerpt || '').replace(/<[^>]+>/g, '') || (post.content || '').replace(/<[^>]+>/g, '').slice(0,150) + '...';
        return `
          <a href="/blog/${slug}.html" class="block bg-dark-light/30 rounded-xl overflow-hidden border border-gray-700/30 shadow-lg hover:shadow-2xl transition">
            <div class="h-48 overflow-hidden">
              <img src="${img}" alt="${title}" class="w-full h-full object-cover">
            </div>
            <div class="p-4">
              <h3 class="text-lg font-semibold mb-2">${title}</h3>
              <p class="text-gray-300 text-sm">${escapeHtml(excerpt)}</p>
            </div>
          </a>
        `;
      }).join('\n');
    })
    .catch(err => {
      console.error('Featured load error', err);
      grid.innerHTML = '<p class="text-gray-400">Error loading featured posts.</p>';
    });

  function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
});

