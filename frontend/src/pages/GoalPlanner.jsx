import { useEffect, useMemo, useState } from 'react'
import GoalPlannerCore from '../components/GoalPlannerCore'
import api from '../utils/api'

export default function GoalPlannerPage({ monthlyData: incomingMonthly }) {
  const [goal, setGoal] = useState(() => {
    try { return JSON.parse(localStorage.getItem('finaura_goal')||'null') } catch { return null }
  })
  const [expenses, setExpenses] = useState([])
  const [income, setIncome] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const [e, i] = await Promise.all([
          api.get('/api/expenses'),
          api.get('/api/income')
        ])
        setExpenses(e.data); setIncome(i.data)
      } catch {}
    }
    load()
  }, [])

  // Accept monthlyData via props or try to reconstruct minimal from local cache (fallback none)
  const ym = (d) => {
    if (!d) return 'Unknown'
    const dt = new Date(d)
    if (isNaN(dt)) return 'Unknown'
    return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`
  }
  const monthlyData = useMemo(() => {
    if (incomingMonthly && incomingMonthly.length) return incomingMonthly
    const map = new Map()
    income.forEach(i => {
      const k = ym(i.date)
      const obj = map.get(k) || { month: k, income: 0, expenses: 0 }
      obj.income += Number(i.amount)||0
      map.set(k, obj)
    })
    expenses.forEach(e => {
      const k = ym(e.date)
      const obj = map.get(k) || { month: k, income: 0, expenses: 0 }
      obj.expenses += Number(e.amount)||0
      map.set(k, obj)
    })
    return [...map.values()].sort((a,b)=>a.month.localeCompare(b.month))
  }, [incomingMonthly, income, expenses])

  return (
    <div className="space-y-4">
      <div className="text-slate-200 text-xl font-semibold">Smart Goal Planner</div>
      <GoalPlannerCore
        initialGoal={goal}
        monthlyData={monthlyData}
        onSave={(g)=>{ localStorage.setItem('finaura_goal', JSON.stringify(g)); setGoal(g) }}
      />
    </div>
  )
}
