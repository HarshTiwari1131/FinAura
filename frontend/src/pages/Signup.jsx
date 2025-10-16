import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/api/auth/signup', { name, email, password })
      nav('/login')
    } catch (e) {
      setError('Signup failed')
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Create your account</h2>
      <form onSubmit={submit} className="space-y-3">
        <input className="input" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required />
        <input className="input" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <button className="btn w-full">Sign up</button>
      </form>
    </div>
  )
}
