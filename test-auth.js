// Test authentication API endpoints
const fetch = require('node-fetch')

const BASE_URL = 'http://localhost:3000'

async function testSignup() {
  console.log('\n=== Testing Signup ===')
  try {
    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'Test@123456'
      })
    })
    
    const data = await response.json()
    const cookies = response.headers.get('set-cookie')
    
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    console.log('Cookies:', cookies)
    
    return { success: response.ok, data, cookies }
  } catch (error) {
    console.error('Signup error:', error.message)
    return { success: false, error: error.message }
  }
}

async function testLogin() {
  console.log('\n=== Testing Login ===')
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@chulbulijewels.com',
        password: 'Admin@123'
      })
    })
    
    const data = await response.json()
    const cookies = response.headers.get('set-cookie')
    
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    console.log('Cookies:', cookies)
    
    return { success: response.ok, data, cookies }
  } catch (error) {
    console.error('Login error:', error.message)
    return { success: false, error: error.message }
  }
}

async function runTests() {
  console.log('Starting authentication tests...')
  console.log('Make sure the dev server is running on port 3000')
  
  await testLogin()
  await testSignup()
  
  console.log('\n=== Tests Complete ===')
}

runTests()
