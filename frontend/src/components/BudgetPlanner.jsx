import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'

export default function BudgetPlanner() {
  const [budgets, setBudgets] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ month: '', limit: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const { data } = await api.get('/api/budget')
    setBudgets(data)
  }
  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ month: '', limit: '' })
    setShowModal(true)
  }
  const openEdit = (b) => {
    setEditing(b)
    setForm({ month: b.month || '', limit: String(b.limit || '') })
    setShowModal(true)
  }
  const close = () => setShowModal(false)

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/api/budget/${editing._id}` , { month: form.month, limit: Number(form.limit) })
      } else {
        await api.post('/api/budget', { month: form.month, limit: Number(form.limit) })
      }
      await load()
      setShowModal(false)
    } finally {
      setSaving(false)
    }
  }

  const del = async (b) => {
    await api.delete(`/api/budget/${b._id}`)
    load()
  }

  const totalLimit = useMemo(() => budgets.reduce((s,b)=> s + (Number(b.limit)||0), 0), [budgets])
  const totalSpent = useMemo(() => budgets.reduce((s,b)=> s + (Number(b.spent)||0), 0), [budgets])

  const monthLabel = (m) => {
    if (!m) return '—'
    const [y, mo] = String(m).split('-')
    const d = new Date(Number(y), Number(mo)-1, 1)
    return d.toLocaleString(undefined, { month: 'long', year: 'numeric' })
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="rounded-xl border border-slate-700/60 bg-slate-800/60 backdrop-blur-sm p-4 flex items-center justify-between">
        <div className="text-slate-300">Overall Budget</div>
        <div className="text-slate-200 font-semibold">₹{totalSpent.toLocaleString()} / ₹{totalLimit.toLocaleString()}</div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-slate-300 font-medium">Budgets</div>
        <button onClick={openAdd} className="btn">Add Budget</button>
      </div>

      {/* Budget Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map(b => {
          const limit = Number(b.limit)||0
          const spent = Number(b.spent)||0
          const pct = limit > 0 ? Math.min(100, Math.round((spent/limit)*100)) : 0
          const over = spent > limit
          return (
            <div key={b._id} className="rounded-xl border border-slate-700/60 bg-slate-800/60 backdrop-blur-sm p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-slate-200 font-semibold">{monthLabel(b.month)}</div>
                  <div className="text-xs text-slate-400">Monthly Limit</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>openEdit(b)} className="btn-secondary px-2 py-1 text-xs">Edit</button>
                  <button onClick={()=>del(b)} className="btn-secondary px-2 py-1 text-xs">Delete</button>
                </div>
              </div>
              <div className="mt-3 text-sm text-slate-300">₹{spent.toLocaleString()} / ₹{limit.toLocaleString()}</div>
              <div className="mt-2 h-2 w-full rounded-full bg-slate-700 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${over ? 'bg-red-500' : 'bg-blue-600'}`}
                  style={{ width: `${over ? 100 : pct}%` }}
                />
              </div>
              <div className="mt-2 text-xs flex items-center gap-2">
                {over ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-400">{Math.round(((spent-limit)/Math.max(1,limit))*100)}% Over Limit</span>
                  </>
                ) : (
                  <span className="text-slate-400">On Track</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/50">
            <motion.div initial={{ scale: 0.98, y: 8, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.98, y: 8, opacity: 0 }} transition={{ duration: 0.2 }} className="w-full max-w-md rounded-xl border border-slate-700/60 bg-slate-800 p-6">
              <div className="text-slate-200 font-semibold">{editing ? 'Edit Budget' : 'Add Budget'}</div>
              <form className="mt-4 space-y-4" onSubmit={save}>
                <label className="block">
                  <div className="text-xs text-slate-400 mb-1">Month</div>
                  <input
                    className="w-full rounded-lg bg-slate-700/70 border border-slate-700 text-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
                    placeholder="2025-10"
                    value={form.month}
                    onChange={e=>setForm(f=>({...f, month: e.target.value}))}
                    required
                  />
                </label>
                <label className="block">
                  <div className="text-xs text-slate-400 mb-1">Monthly Limit (₹)</div>
                  <input
                    className="w-full rounded-lg bg-slate-700/70 border border-slate-700 text-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
                    type="number"
                    min="0"
                    value={form.limit}
                    onChange={e=>setForm(f=>({...f, limit: e.target.value}))}
                    required
                  />
                </label>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={close} className="btn-secondary">Cancel</button>
                  <button disabled={saving} className="btn" type="submit">{saving ? 'Saving...' : 'Save'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
