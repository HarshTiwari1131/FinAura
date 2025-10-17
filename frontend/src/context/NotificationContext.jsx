import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../utils/api'
import { useAuth } from './AuthContext'

const NotificationCtx = createContext(null)

const initialAlerts = []

export function NotificationProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [alerts, setAlerts] = useState(initialAlerts)
  const { user } = useAuth() || {}

  // Load notifications per-user from backend if available
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!user) { setAlerts([]); return }
      try {
        const { data } = await api.get('/api/notifications').catch(() => ({ data: [] }))
        if (!cancelled) setAlerts(Array.isArray(data) ? data.map(n => ({
          id: n.id || n._id || String(n.id || n._id || Date.now()),
          ts: n.ts,
          type: n.type,
          title: n.title,
          text: n.text,
          read: !!n.read,
        })) : [])
      } catch {
        if (!cancelled) setAlerts([])
      }
    }
    load()
    return () => { cancelled = true }
  }, [user])

  const unreadCount = useMemo(() => alerts.filter(a=>!a.read).length, [alerts])

  const markRead = (id) => setAlerts(list => list.map(a => (a.id === id || a._id === id) ? { ...a, id: a.id || a._id, read: true } : a))
  const clearAll = () => setAlerts([])
  const addAlert = (alert) => setAlerts(list => [{ id: alert.id || alert._id || String(Date.now()), read: false, ...alert }, ...list])

  const value = { open, setOpen, toggle: ()=>setOpen(v=>!v), alerts, setAlerts, markRead, clearAll, addAlert, unreadCount }
  return <NotificationCtx.Provider value={value}>{children}</NotificationCtx.Provider>
}

export const useNotifications = () => useContext(NotificationCtx)
