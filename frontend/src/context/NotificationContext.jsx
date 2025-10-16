import { createContext, useContext, useMemo, useState } from 'react'

const NotificationCtx = createContext(null)

const initialAlerts = [
  { id: 'a1', type: 'critical', title: 'Budget Exceeded', text: 'Food budget exceeded by 8%.', ts: new Date().toISOString(), read: false },
  { id: 'a2', type: 'ai', title: 'AI Tip', text: 'Shift 5% to low-risk funds this month.', ts: new Date(Date.now()-3600e3).toISOString(), read: false },
  { id: 'a3', type: 'general', title: 'Payment Success', text: 'Premium activated.', ts: new Date(Date.now()-86400e3).toISOString(), read: true },
]

export function NotificationProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [alerts, setAlerts] = useState(initialAlerts)

  const unreadCount = useMemo(() => alerts.filter(a=>!a.read).length, [alerts])

  const markRead = (id) => setAlerts(list => list.map(a => a.id === id ? { ...a, read: true } : a))
  const clearAll = () => setAlerts([])
  const addAlert = (alert) => setAlerts(list => [{ id: String(Date.now()), read: false, ...alert }, ...list])

  const value = { open, setOpen, toggle: ()=>setOpen(v=>!v), alerts, setAlerts, markRead, clearAll, addAlert, unreadCount }
  return <NotificationCtx.Provider value={value}>{children}</NotificationCtx.Provider>
}

export const useNotifications = () => useContext(NotificationCtx)
