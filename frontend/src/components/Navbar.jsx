import { Link } from 'react-router-dom'
import { useNotifications } from '../context/NotificationContext'
import { useTheme } from '../context/ThemeContext'
import { useState, useCallback } from 'react'
import MobileDrawer from './MobileDrawer'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { toggle, unreadCount } = useNotifications() || { toggle: ()=>{}, unreadCount: 0 }
  const { theme, toggleTheme } = useTheme() || { theme: 'dark', toggleTheme: ()=>{} }
  const { token, logout } = useAuth() || { token: null, logout: ()=>{} }
  const [open, setOpen] = useState(false)
  const openMenu = useCallback(() => setOpen(true), [])
  const closeMenu = useCallback(() => setOpen(false), [])
  return (
    <header className="sticky top-0 z-10 backdrop-blur border-b" style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          {/* Hamburger on mobile */}
          <button onClick={openMenu} className="md:hidden rounded-lg p-2" aria-label="Open menu" style={{ border: '1px solid var(--border)' }}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          </button>
          <Link to="/" className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-accent animate-pulse" />
          <span className="font-semibold text-accent">FinAura</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm" style={{ color: 'var(--text-muted)' }}>
          <a href="#features" className="hover:opacity-100" style={{ color: 'var(--text)' }}>Features</a>
          {/* <a href="#pricing" className="hover:text-white">Pricing</a> */}
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={toggle} aria-label="Notifications" className="relative rounded-lg p-2" style={{ border: '1px solid var(--border)' }}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" style={{ color: 'var(--text)' }} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5"/><path d="M9 17v1a3 3 0 0 0 6 0v-1"/></svg>
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />}
          </button>
          <button onClick={toggleTheme} aria-label="Toggle Theme" className="rounded-lg p-2" style={{ border: '1px solid var(--border)' }}>
            {theme === 'light' ? (
              // Moon icon for switching to dark
              <svg viewBox="0 0 24 24" className="h-5 w-5" style={{ color: 'var(--text)' }} fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            ) : (
              // Sun icon for switching to light
              <svg viewBox="0 0 24 24" className="h-5 w-5" style={{ color: 'var(--text)' }} fill="currentColor"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zM1 13h3v-2H1v2zm10-9h2V1h-2v3zm7.66 1.87l1.79-1.8-1.41-1.41-1.8 1.79 1.42 1.42zM17 13h3v-2h-3v2zM4.96 19.07l-1.79 1.8 1.41 1.41 1.8-1.79-1.42-1.42zM11 23h2v-3h-2v3zm7.04-3.93l1.8 1.79 1.41-1.41-1.79-1.8-1.42 1.42zM12 8a4 4 0 100 8 4 4 0 000-8z"/></svg>
            )}
          </button>
          {token ? (
            <>
              {/* Desktop: Logout */}
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => { try { logout?.() } catch {} window.location.href = '/login' }}
                  className="btn-secondary"
                >
                  Logout
                </button>
              </div>
              {/* Mobile: Logout */}
              <div className="flex md:hidden items-center gap-2">
                <button
                  onClick={() => { try { logout?.() } catch {} window.location.href = '/login' }}
                  className="rounded-lg px-3 py-2 text-sm"
                  style={{ border: '1px solid var(--border)', color: 'var(--text)' }}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Desktop auth buttons */}
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login" className="btn-secondary">Login</Link>
                <Link to="/signup" className="btn">Sign Up</Link>
              </div>
              {/* Mobile auth buttons */}
              <div className="flex md:hidden items-center gap-2">
                <Link to="/login" className="rounded-lg px-3 py-2 text-sm" style={{ border: '1px solid var(--border)', color: 'var(--text)' }}>Login</Link>
                <Link to="/signup" className="btn text-sm">Sign Up</Link>
              </div>
            </>
          )}
        </div>
      </div>
      <MobileDrawer open={open} onClose={closeMenu} />
    </header>
  )
}
