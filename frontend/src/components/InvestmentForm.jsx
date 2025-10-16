import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'

const types = [
  { value: 'Stock', label: 'Stocks', icon: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12h4v8H3zM10 8h4v12h-4zM17 4h4v16h-4z"/></svg>
  )},
  { value: 'Crypto', label: 'Crypto', icon: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="8"/><path d="M8 12h8M12 8v8"/></svg>
  )},
  { value: 'MF', label: 'Mutual Funds', icon: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 7h16v10H4z"/><path d="M8 7v-2h8v2"/></svg>
  )},
]

const risks = ['Low','Medium','High']

export default function InvestmentForm({ onCreated }) {
  const [show, setShow] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({ type: 'Stock', amount: '', roi: '0.12', riskLevel: 'Medium', date: '' })

  useEffect(() => {
    if (!form.date) {
      const t = new Date()
      const d = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`
      setForm(f => ({ ...f, date: d }))
    }
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    await api.post('/api/investment', { ...form, amount: Number(form.amount), roi: Number(form.roi) })
    setShow(false)
    setSuccess(true)
    setTimeout(()=> setSuccess(false), 900)
    setForm(f => ({ ...f, amount: '' }))
    onCreated?.()
  }

  return (
    <>
      <button className="btn w-full" onClick={()=>setShow(true)}>Add Investment</button>

      <AnimatePresence>
        {show && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.98, y: 8, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.98, y: 8, opacity: 0 }} transition={{ duration: 0.2 }} className="w-full max-w-md rounded-xl border border-slate-700/60 bg-slate-800 p-6">
              <div className="text-slate-200 font-semibold">Add Investment</div>
              <form className="mt-4 space-y-4" onSubmit={submit}>
                <label className="block">
                  <div className="text-xs text-slate-400 mb-1">Amount (₹)</div>
                  <input className="w-full font-mono text-xl font-semibold rounded-lg bg-slate-700/70 border border-slate-700 text-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400" type="number" min="0" step="0.01" value={form.amount} onChange={e=>setForm(f=>({...f, amount:e.target.value}))} required />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <div className="text-xs text-slate-400 mb-1">Type</div>
                    <div className="relative">
                      <select className="w-full appearance-none rounded-lg bg-slate-700/70 border border-slate-700 text-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 pr-8" value={form.type} onChange={e=>setForm(f=>({...f, type:e.target.value}))}>
                        {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                        {types.find(t => t.value === form.type)?.icon}
                      </div>
                    </div>
                  </label>
                  <label className="block">
                    <div className="text-xs text-slate-400 mb-1">Risk Level</div>
                    <select className="w-full rounded-lg bg-slate-700/70 border border-slate-700 text-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400" value={form.riskLevel} onChange={e=>setForm(f=>({...f, riskLevel:e.target.value}))}>
                      {risks.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <div className="text-xs text-slate-400 mb-1">ROI (e.g., 0.12)</div>
                    <input className="w-full rounded-lg bg-slate-700/70 border border-slate-700 text-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400" type="number" step="0.01" value={form.roi} onChange={e=>setForm(f=>({...f, roi:e.target.value}))} required />
                  </label>
                  <label className="block">
                    <div className="text-xs text-slate-400 mb-1">Date</div>
                    <input className="w-full rounded-lg bg-slate-700/70 border border-slate-700 text-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400" type="date" value={form.date} onChange={e=>setForm(f=>({...f, date:e.target.value}))} required />
                  </label>
                </div>

                <div className="flex justify-end gap-2">
                  <button type="button" className="btn-secondary" onClick={()=>setShow(false)}>Cancel</button>
                  <button className="btn" type="submit">Save</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success checkmark */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: 6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.96 }} className="fixed bottom-6 right-6 z-50">
            <div className="flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-3 py-1 text-sm">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Saved
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
