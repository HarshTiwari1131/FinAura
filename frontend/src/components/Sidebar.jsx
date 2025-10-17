import { Link, useLocation } from 'react-router-dom'

export const navItems = [
  { label: 'Home', to: '/', icon: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h14V10"/></svg>
  )},
  { label: 'Dashboard', to: '/dashboard', icon: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12h7V3H3v9zm0 9h7v-7H3v7zm11 0h7v-9h-7v9zm0-18v7h7V3h-7z"/></svg>
  )},
  { label: 'Profile', to: '/profile', icon: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5z"/><path d="M3 21a9 9 0 0 1 18 0"/></svg>
  )},
  { label: 'Investment Simulator', to: '/simulate', icon: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2l2 2-4 4L2 6 6 2zm3 3l10 10M3 21l5-5"/></svg>
  )},
  { label: 'Expenses', to: '/expenses', icon: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M8 12h8"/></svg>
  )},
  { label: 'Income', to: '/income', icon: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 8v8"/></svg>
  )},
  { label: 'Investments', to: '/investments', icon: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 17l6-6 4 4 7-7"/><path d="M14 4h7v7"/></svg>
  )},
  { label: 'Goal Planner', to: '/goals', icon: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
  )},
  { label: 'Chat', to: '/chat', icon: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>
  )},
  { label: 'Payments', to: '/pay', icon: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
  )},
]

export default function Sidebar() {
  const { pathname } = useLocation()
  const isActive = (to) => (to === '/' ? pathname === '/' : pathname.startsWith(to))

  return (
    <aside className="w-64 hidden md:block p-4">
      <div className="sticky top-16">
        <div className="rounded-2xl border card-base p-3">
          <ul className="space-y-1">
            {navItems.map(({ label, to, icon }) => {
              const active = isActive(to)
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className="relative group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
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
                    {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-accent" />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </aside>
  )
}
