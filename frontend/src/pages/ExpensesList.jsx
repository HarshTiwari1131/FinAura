import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'

const categories = ['Food', 'Rent', 'Transport', 'Bills', 'Shopping', 'Health', 'Entertainment', 'Other']
const methods = ['UPI', 'Card', 'Cash', 'NetBanking', 'Wallet']

export default function ExpensesList() {
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sort, setSort] = useState('date_desc')
  const [editing, setEditing] = useState(null) // record being edited
  const [form, setForm] = useState({ category: '', amount: '', date: '', note: '', paymentMethod: 'UPI' })

  const load = async () => {
    const { data } = await api.get('/api/expenses')
    setItems(data)
  }
  useEffect(()=>{ load() }, [])

  const cats = useMemo(()=> Array.from(new Set(items.map(i=>i.category).filter(Boolean))).sort(), [items])

  const filtered = useMemo(()=>{
    let rows = [...items]
    if (q) rows = rows.filter(r => (r.note || '').toLowerCase().includes(q.toLowerCase()) || (r.category||'').toLowerCase().includes(q.toLowerCase()))
    if (cat) rows = rows.filter(r => r.category === cat)
    if (from) rows = rows.filter(r => new Date(r.date) >= new Date(from))
    if (to) rows = rows.filter(r => new Date(r.date) <= new Date(to))
    rows.sort((a,b)=>{
      if (sort === 'date_desc') return new Date(b.date) - new Date(a.date)
      if (sort === 'date_asc') return new Date(a.date) - new Date(b.date)
      if (sort === 'amount_desc') return (b.amount||0) - (a.amount||0)
      if (sort === 'amount_asc') return (a.amount||0) - (b.amount||0)
      return 0
    })
    return rows
  }, [items, q, cat, from, to, sort])

  const total = filtered.reduce((s, r) => s + (Number(r.amount)||0), 0)

  const remove = async (id) => {
    await api.delete(`/api/expenses/${id}`)
    load()
  }

  const openEdit = (r) => {
    setEditing(r)
    setForm({
      category: r.category || 'Other',
      amount: String(r.amount || ''),
      date: r.date ? new Date(r.date).toISOString().slice(0,10) : '',
      note: r.note || '',
      paymentMethod: r.paymentMethod || 'UPI',
    })
  }

  const submitEdit = async (e) => {
    e.preventDefault()
    if (!editing?._id) return
    await api.put(`/api/expenses/${editing._id}`, {
      ...form,
      amount: Number(form.amount||0)
    })
    setEditing(null)
    load()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold text-white">Expense History</h2>
          <div className="text-sm text-slate-400">Review and manage your expenses</div>
        </div>
        <div className="flex items-center gap-2">
          <select className={`rounded-lg border px-2 py-1.5 bg-slate-800 text-slate-200 ${sort.startsWith('date')? 'border-cyan-500/40':'border-slate-700/60'}`} value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="date_desc">Newest</option>
            <option value="date_asc">Oldest</option>
            <option value="amount_desc">Amount ↓</option>
            <option value="amount_asc">Amount ↑</option>
          </select>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-700/60 bg-slate-800/60 backdrop-blur-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input className="rounded-lg bg-slate-700/70 border border-slate-700 text-slate-50 px-3 py-2" placeholder="Search note/category" value={q} onChange={e=>setQ(e.target.value)} />
          <select className="rounded-lg bg-slate-700/70 border border-slate-700 text-slate-50 px-3 py-2" value={cat} onChange={e=>setCat(e.target.value)}>
            <option value="">All Categories</option>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input className="rounded-lg bg-slate-700/70 border border-slate-700 text-slate-50 px-3 py-2" type="date" value={from} onChange={e=>setFrom(e.target.value)} />
          <input className="rounded-lg bg-slate-700/70 border border-slate-700 text-slate-50 px-3 py-2" type="date" value={to} onChange={e=>setTo(e.target.value)} />
          <button onClick={()=>{setQ(''); setCat(''); setFrom(''); setTo('')}} className="btn-secondary">Reset</button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-700/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-300">
            <tr className="text-left">
              <th className="px-4 py-2 border-b border-slate-700">Date</th>
              <th className="px-4 py-2 border-b border-slate-700">Category</th>
              <th className="px-4 py-2 border-b border-slate-700">Note</th>
              <th className="px-4 py-2 border-b border-slate-700 text-right">Amount</th>
              <th className="px-4 py-2 border-b border-slate-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {filtered.map(r => (
                <motion.tr key={r._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="group hover:bg-slate-800/70">
                  <td className="px-4 py-2 border-b border-slate-700 text-slate-200">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2 border-b border-slate-700 text-slate-300">{r.category}</td>
                  <td className="px-4 py-2 border-b border-slate-700 text-slate-400">{r.note || '—'}</td>
                  <td className="px-4 py-2 border-b border-slate-700 text-right text-red-400">-₹{Number(r.amount||0).toLocaleString()}</td>
                  <td className="px-4 py-2 border-b border-slate-700 text-right">
                    <div className="inline-flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={()=>openEdit(r)} className="btn-secondary px-2 py-1 text-xs">Edit</button>
                      <button onClick={()=>remove(r._id)} className="btn-secondary px-2 py-1 text-xs">Delete</button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="flex items-center justify-between text-sm text-slate-400">
        <div>{filtered.length} entries</div>
        <div>Total: <span className="text-red-400">-₹{total.toLocaleString()}</span></div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.98, y: 8, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.98, y: 8, opacity: 0 }} transition={{ duration: 0.2 }} className="w-full max-w-md rounded-xl border border-slate-700/60 bg-slate-800 p-6">
              <div className="text-slate-200 font-semibold">Edit Expense</div>
              <form className="mt-4 space-y-4" onSubmit={submitEdit}>
                <label className="block">
                  <div className="text-xs text-slate-400 mb-1">Amount (₹)</div>
                  <input className="w-full font-mono text-xl font-semibold rounded-lg bg-slate-700/70 border border-slate-700 text-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400" type="number" min="0" step="0.01" value={form.amount} onChange={e=>setForm(f=>({...f, amount:e.target.value}))} required />
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <div className="text-xs text-slate-400 mb-1">Category</div>
                    <select className="w-full rounded-lg bg-slate-700/70 border border-slate-700 text-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400" value={form.category} onChange={e=>setForm(f=>({...f, category:e.target.value}))}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <div className="text-xs text-slate-400 mb-1">Payment Method</div>
                    <select className="w-full rounded-lg bg-slate-700/70 border border-slate-700 text-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400" value={form.paymentMethod} onChange={e=>setForm(f=>({...f, paymentMethod:e.target.value}))}>
                      {methods.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </label>
                </div>
                <label className="block">
                  <div className="text-xs text-slate-400 mb-1">Date</div>
                  <input className="w-full rounded-lg bg-slate-700/70 border border-slate-700 text-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400" type="date" value={form.date} onChange={e=>setForm(f=>({...f, date:e.target.value}))} required />
                </label>
                <label className="block">
                  <div className="text-xs text-slate-400 mb-1">Note</div>
                  <input className="w-full rounded-lg bg-slate-700/70 border border-slate-700 text-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400" placeholder="Optional" value={form.note} onChange={e=>setForm(f=>({...f, note:e.target.value}))} />
                </label>
                <div className="flex justify-end gap-2">
                  <button type="button" className="btn-secondary" onClick={()=>setEditing(null)}>Cancel</button>
                  <button className="btn" type="submit">Update</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
