import { AnimatePresence, motion } from 'framer-motion'
import { useNotifications } from '../context/NotificationContext'

function AlertItem({ alert, onRead }) {
  const color = alert.type === 'critical' ? 'text-red-400 border-red-500/30' : alert.type === 'ai' ? 'text-cyan-300 border-cyan-500/30' : 'text-slate-200 border-slate-600/40'
  return (
    <motion.li
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2 }}
      className={`rounded-lg border p-3 bg-slate-900/40 ${color}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-medium">{alert.title}</div>
          <div className="text-xs text-slate-400">{new Date(alert.ts).toLocaleString()}</div>
        </div>
        {!alert.read && <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse mt-1" />}
      </div>
      <div className="mt-2 text-sm text-slate-300">{alert.text}</div>
      {!alert.read && (
        <div className="mt-2 flex justify-end">
          <button onClick={onRead} className="btn-secondary px-2 py-1 text-xs">Mark as Read</button>
        </div>
      )}
    </motion.li>
  )
}

export default function NotificationPanel() {
  const { open, setOpen, alerts, markRead, clearAll } = useNotifications()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-slate-800/95 backdrop-blur-md border-l border-slate-700/60 p-4 flex flex-col"
          >
            <div className="flex items-center justify-between">
              <div className="text-slate-200 font-semibold">Notifications</div>
              <div className="flex items-center gap-2">
                <button onClick={clearAll} className="btn-secondary px-2 py-1 text-xs">Clear All</button>
                <button onClick={()=>setOpen(false)} className="btn-secondary px-2 py-1 text-xs">Close</button>
              </div>
            </div>

            <ul className="mt-4 space-y-3 overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {alerts.length === 0 ? (
                  <div className="text-sm text-slate-400">No notifications</div>
                ) : (
                  alerts.map(a => (
                    <AlertItem key={a.id} alert={a} onRead={() => markRead(a.id)} />
                  ))
                )}
              </AnimatePresence>
            </ul>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
