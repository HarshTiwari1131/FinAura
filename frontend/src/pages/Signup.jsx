import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { motion } from 'framer-motion'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
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
    <div className="w-full flex items-center justify-center py-12 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
  className="w-full max-w-md rounded-xl border card-base shadow-2xl p-8"
      >
        {/* Branding */}
        <div className="mb-6 flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
          <span className="font-semibold text-accent">FinAura</span>
        </div>

  <h2 className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>Create your account</h2>
  <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Join FinAura and manage money the smarter way.</p>

        {/* Form */}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Full Name</label>
            <input
              className="input w-full"
              placeholder="Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Email</label>
            <input
              className="input w-full"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Password</label>
            <input
              className="input w-full"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Confirm Password</label>
            <input
              className="input w-full"
              placeholder="••••••••"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <motion.button
            whileTap={{ scale: 0.98 }}
            className="btn w-full"
            type="submit"
            onClick={(e) => {
              if (password !== confirm) {
                e.preventDefault()
                setError('Passwords do not match')
              }
            }}
          >
            Create Account
          </motion.button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or continue with</span>
          <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button className="btn-secondary w-full">Google</button>
          <button className="btn-secondary w-full">Apple</button>
        </div>

  <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-300 hover:text-cyan-200">Log in</Link>
        </p>
      </motion.div>
    </div>
  )
}
