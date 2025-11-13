const http = require('http');
const fs = require('fs');
const path = require('path');

function requestJson(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function login(username, password) {
  const postData = JSON.stringify({ username, password });
  const opts = {
    hostname: 'localhost', port: 3000, path: '/admin/login', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
  };
  const res = await requestJson(opts, postData);
  return res;
}

async function uploadImage(token, filePath) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).slice(2);
  const fileBuffer = fs.readFileSync(filePath);
  const filename = path.basename(filePath);
  const partHeader = `--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="${filename}"\r\nContent-Type: application/octet-stream\r\n\r\n`;
  const partFooter = `\r\n--${boundary}--\r\n`;
  const bodyBuffer = Buffer.concat([Buffer.from(partHeader, 'utf8'), fileBuffer, Buffer.from(partFooter, 'utf8')]);

  const opts = {
    hostname: 'localhost', port: 3000, path: '/admin/upload-image', method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
      'Content-Length': bodyBuffer.length,
      'Authorization': `Bearer ${token}`
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(opts, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.write(bodyBuffer);
    req.end();
  });
}

async function createBlog(token, blog) {
  const postData = JSON.stringify(blog);
  const opts = {
    hostname: 'localhost', port: 3000, path: '/admin/blogs', method: 'POST',
    headers: {
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData),
      'Authorization': `Bearer ${token}`
    }
  };
  return await requestJson(opts, postData);
}

async function getFeatured() {
  return await requestJson({ hostname: 'localhost', port: 3000, path: '/api/blogs/featured?limit=3', method: 'GET' });
}

(async () => {
  try {
    console.log('Logging in...');
    const loginRes = await login('Josh', '#Ngei1991996');
    console.log('Login status', loginRes.status);
    if (!loginRes.body || !loginRes.body.success) {
      console.error('Login failed:', loginRes.body);
      process.exit(1);
    }
    const token = loginRes.body.token;
    console.log('Token received (first 8 chars):', token.slice(0,8));

    // Upload image using an existing image in repo
    const sampleImage = path.join(__dirname, 'images', 'blog-smart-buildings.jpg');
    if (!fs.existsSync(sampleImage)) {
      console.error('Sample image not found:', sampleImage);
      process.exit(1);
    }

    console.log('Uploading image...');
    const uploadRes = await uploadImage(token, sampleImage);
    console.log('Upload status', uploadRes.status, uploadRes.body);
    if (!uploadRes.body || !uploadRes.body.success) {
      console.error('Upload failed:', uploadRes.body);
      process.exit(1);
    }
    const imageUrl = uploadRes.body.url;

    // Create blog
    const title = 'E2E Test Blog ' + Date.now();
    const slug = title.toLowerCase().replace(/[^\\w\\s-]/g, '').trim().replace(/\\s+/g, '-');
    const blog = {
      title,
      category: 'Testing',
      excerpt: 'End-to-end test blog post',
      content: `<h2>Test</h2><p>This is an automated test blog created at ${new Date().toISOString()}</p>`,
      featured: true,
      image: imageUrl,
      author: 'Automation',
      status: 'published'
    };

    console.log('Creating blog...');
    const createRes = await createBlog(token, blog);
    console.log('Create status', createRes.status, createRes.body);
    if (!createRes.body || !createRes.body.success) {
      console.error('Create blog failed:', createRes.body);
      process.exit(1);
    }

    // Check featured
    console.log('Fetching featured posts...');
    const feat = await getFeatured();
    console.log('Featured status', feat.status);
    if (!feat.body || !feat.body.success) {
      console.error('Featured fetch failed:', feat.body);
      process.exit(1);
    }

    const found = (feat.body.blogs || []).some(b => b.title === title || b.slug === slug);
    if (found) {
      console.log(' E2E test succeeded: created blog appears in featured posts');
      console.log('Public blog URL:', `/blog/${slug}.html`);
      process.exit(0);
    } else {
      console.error(' Created blog not found in featured posts. Featured API returned:', feat.body.blogs.map(b=>b.title));
      process.exit(1);
    }

  } catch (err) {
    console.error('Error during E2E test:', err);
    process.exit(1);
  }
})();
