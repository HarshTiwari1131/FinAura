import { useState } from 'react'
import api from '../utils/api'

export default function InvestmentForm({ onCreated }) {
  const [form, setForm] = useState({ type: '', amount: '', roi: '', riskLevel: '', date: '' })
  const submit = async (e) => {
    e.preventDefault()
    await api.post('/api/investment', { ...form, amount: Number(form.amount), roi: Number(form.roi) })
    setForm({ type: '', amount: '', roi: '', riskLevel: '', date: '' })
    onCreated?.()
  }
  return (
    <form onSubmit={submit} className="space-y-2">
      <input className="input" placeholder="Type" value={form.type} onChange={e=>setForm(f=>({...f, type:e.target.value}))} required />
      <input className="input" placeholder="Amount" type="number" value={form.amount} onChange={e=>setForm(f=>({...f, amount:e.target.value}))} required />
      <input className="input" placeholder="ROI (0.12)" type="number" step="0.01" value={form.roi} onChange={e=>setForm(f=>({...f, roi:e.target.value}))} required />
      <input className="input" placeholder="Risk Level" value={form.riskLevel} onChange={e=>setForm(f=>({...f, riskLevel:e.target.value}))} required />
      <input className="input" placeholder="Date" type="date" value={form.date} onChange={e=>setForm(f=>({...f, date:e.target.value}))} required />
      <button className="btn">Add Investment</button>
    </form>
  )
}
