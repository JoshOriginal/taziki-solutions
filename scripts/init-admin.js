const { createUser } = require('../admin-auth');
require('dotenv').config();

const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.env.ADMIN_PASSWORD || 'taziki2025';

createUser(username, password);
console.log(`Created/updated admin user: ${username}`);
