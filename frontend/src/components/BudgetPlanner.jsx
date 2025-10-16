import { useEffect, useState } from 'react'
import api from '../utils/api'

export default function BudgetPlanner() {
  const [budgets, setBudgets] = useState([])
  const [month, setMonth] = useState('')
  const [limit, setLimit] = useState('')

  const load = async () => {
    const { data } = await api.get('/api/budget')
    setBudgets(data)
  }
  useEffect(() => { load() }, [])

  const add = async (e) => {
    e.preventDefault()
    await api.post('/api/budget', { month, limit: Number(limit) })
    setMonth(''); setLimit(''); load()
  }

  return (
    <div className="space-y-3">
      <form onSubmit={add} className="space-x-2">
        <input className="input" placeholder="Month (2025-10)" value={month} onChange={e=>setMonth(e.target.value)} required />
        <input className="input" placeholder="Limit" type="number" value={limit} onChange={e=>setLimit(e.target.value)} required />
        <button className="btn">Add</button>
      </form>
      <ul className="space-y-2">
        {budgets.map(b => (
          <li key={b._id} className="p-3 rounded border border-gray-800">
            <div className="font-medium">{b.month}</div>
            <div className="text-sm text-gray-400">Limit: ₹{b.limit} • Spent: ₹{b.spent}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
