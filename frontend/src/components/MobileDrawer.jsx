import { Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { navItems } from './Sidebar'

export default function MobileDrawer({ open, onClose }) {
  const { pathname } = useLocation()
  const isActive = (to) => (to === '/' ? pathname === '/' : pathname.startsWith(to))
  const { token, logout } = useAuth() || { token: null, logout: ()=>{} }

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div aria-hidden={!open} className={`fixed inset-0 z-40 md:hidden ${open ? '' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'rgba(0,0,0,0.4)' }}
      />
      {/* Panel */}
      <aside
        id="mobile-menu"
        className={`absolute top-0 left-0 h-full w-72 transform transition-transform card-base border-r p-4 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-accent animate-pulse" />
            <span className="font-semibold text-accent">FinAura</span>
          </div>
          <button onClick={onClose} aria-label="Close menu" className="rounded-lg p-2" style={{ border: '1px solid var(--border)' }}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
        <ul className="space-y-1">
          {navItems.map(({ label, to, icon }) => {
            const active = isActive(to)
            return (
              <li key={to}>
                <Link
                  to={to}
                  onClick={onClose}
                  className="relative flex items-center gap-3 px-3 py-2 rounded-lg"
                  style={{
                    color: active ? 'var(--text)' : 'var(--text-muted)',
                    border: '1px solid ' + (active ? 'var(--accent)' : 'transparent'),
                    background: active ? 'rgba(34,211,238,0.12)' : 'transparent'
                  }}
                >
                  <span className="flex items-center justify-center h-6 w-6" style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}>
                    {icon}
                  </span>
                  <span className="truncate">{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
        {token && (
          <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => { try { logout?.() } catch {} onClose?.(); window.location.href = '/login' }}
              className="w-full rounded-lg px-3 py-2 text-left"
              style={{ border: '1px solid var(--border)', color: 'var(--text)' }}
            >
              Logout
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}
