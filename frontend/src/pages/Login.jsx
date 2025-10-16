import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()
  const { setToken } = useAuth()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/api/auth/login', { email, password })
      setToken(data.access_token)
      nav('/dashboard')
    } catch (e) {
      setError('Invalid credentials')
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Welcome back</h2>
      <form onSubmit={submit} className="space-y-3">
        <input className="input" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <button className="btn w-full">Login</button>
      </form>
    </div>
  )
}
