require('dotenv').config();
const { generateToken } = require('./src/utils/jwt');

async function testApi() {
  try {
    const token = generateToken(1, 1); // User 1, Role 1 (ADMIN)
    console.log("Using Secret:", process.env.JWT_SECRET);
    console.log("Generated Token:", token);

    const res = await fetch('http://localhost:5000/api/users', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    console.log("Users API Response Status:", res.status);
    console.log("Users API Response Data:", data);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testApi();
