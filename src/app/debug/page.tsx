'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'

export default function DebugPage() {
  const [testResult, setTestResult] = useState('')
  const { user, token } = useAuthStore()

  const testSignup = async () => {
    setTestResult('Testing signup...')
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: 'Test User',
          email: `test${Date.now()}@example.com`,
          password: 'Test1234',
        }),
      })

      const data = await response.json()
      setTestResult(`Status: ${response.status}\n${JSON.stringify(data, null, 2)}`)
    } catch (error: any) {
      setTestResult(`Error: ${error.message}`)
    }
  }

  const testLogin = async () => {
    setTestResult('Testing login...')
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: 'admin@chulbulijewels.com',
          password: 'Admin@123',
        }),
      })

      const data = await response.json()
      setTestResult(`Status: ${response.status}\n${JSON.stringify(data, null, 2)}`)
    } catch (error: any) {
      setTestResult(`Error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Auth Debug Page</h1>

      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-bold mb-4">Current Auth State</h2>
        <pre className="bg-gray-100 p-4 rounded">
          User: {JSON.stringify(user, null, 2)}
          {'\n'}Token: {token || 'null'}
        </pre>
      </div>

      <div className="mb-8">
        <button
          onClick={testSignup}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
        >
          Test Signup
        </button>
        <button
          onClick={testLogin}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Test Login
        </button>
      </div>

      {testResult && (
        <div className="p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-bold mb-4">Test Result</h2>
          <pre className="whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}
    </div>
  )
}
