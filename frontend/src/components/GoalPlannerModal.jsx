import { AnimatePresence, motion } from 'framer-motion'

export default function GoalPlannerModal({ open, onClose, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/50">
          <motion.div initial={{ scale: 0.98, y: 8, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.98, y: 8, opacity: 0 }} transition={{ duration: 0.2 }} className="w-full max-w-3xl rounded-xl border border-slate-700/60 bg-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div className="text-slate-200 font-semibold">Smart Goal Planner</div>
              <button className="btn-secondary" onClick={onClose}>Close</button>
            </div>
            <div className="mt-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
