import { useState } from 'react'
import api from '../utils/api'

export default function ExpenseForm({ onCreated }) {
  const [form, setForm] = useState({ category: '', amount: '', date: '', note: '' })
  const submit = async (e) => {
    e.preventDefault()
    await api.post('/api/expenses', { ...form, amount: Number(form.amount) })
    setForm({ category: '', amount: '', date: '', note: '' })
    onCreated?.()
  }
  return (
    <form onSubmit={submit} className="space-y-2">
      <input className="input" placeholder="Category" value={form.category} onChange={e=>setForm(f=>({...f, category:e.target.value}))} required />
      <input className="input" placeholder="Amount" type="number" value={form.amount} onChange={e=>setForm(f=>({...f, amount:e.target.value}))} required />
      <input className="input" placeholder="Date" type="date" value={form.date} onChange={e=>setForm(f=>({...f, date:e.target.value}))} required />
      <input className="input" placeholder="Note" value={form.note} onChange={e=>setForm(f=>({...f, note:e.target.value}))} />
      <button className="btn">Add Expense</button>
    </form>
  )
}
