import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'

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
    <div className="w-full flex items-center justify-center py-12 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md rounded-xl bg-slate-800/90 border border-slate-700/70 shadow-2xl shadow-blue-900/40 p-8"
      >
        {/* Branding */}
        <div className="mb-6 flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
          <span className="font-semibold text-accent">FinAura</span>
        </div>

        <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
        <p className="mt-1 text-slate-400 text-sm">Log in to continue your AI-powered money journey.</p>

        {/* Form */}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Email</label>
            <input
              className="w-full rounded-lg bg-slate-700/70 border border-slate-700 text-slate-50 placeholder-slate-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs text-slate-400 mb-1">Password</label>
              <a href="#" className="text-xs text-cyan-300 hover:text-cyan-200">Forgot password?</a>
            </div>
            <input
              className="w-full rounded-lg bg-slate-700/70 border border-slate-700 text-slate-50 placeholder-slate-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <motion.button
            whileTap={{ scale: 0.98 }}
            className="btn w-full"
            type="submit"
          >
            Log In
          </motion.button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-700" />
          <span className="text-xs text-slate-400">or continue with</span>
          <div className="h-px flex-1 bg-slate-700" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button className="btn-secondary w-full">Google</button>
          <button className="btn-secondary w-full">Apple</button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don’t have an account?{' '}
          <Link to="/signup" className="text-cyan-300 hover:text-cyan-200">Create one</Link>
        </p>
      </motion.div>
    </div>
  )
}
