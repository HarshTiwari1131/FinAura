import { useState } from 'react'
import api from '../utils/api'

export default function IncomeForm({ onCreated }) {
  const [form, setForm] = useState({ source: '', amount: '', date: '' })
  const submit = async (e) => {
    e.preventDefault()
    await api.post('/api/income', { ...form, amount: Number(form.amount) })
    setForm({ source: '', amount: '', date: '' })
    onCreated?.()
  }
  return (
    <form onSubmit={submit} className="space-y-2">
      <input className="input" placeholder="Source" value={form.source} onChange={e=>setForm(f=>({...f, source:e.target.value}))} required />
      <input className="input" placeholder="Amount" type="number" value={form.amount} onChange={e=>setForm(f=>({...f, amount:e.target.value}))} required />
      <input className="input" placeholder="Date" type="date" value={form.date} onChange={e=>setForm(f=>({...f, date:e.target.value}))} required />
      <button className="btn">Add Income</button>
    </form>
  )
}
