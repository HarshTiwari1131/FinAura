import { useEffect, useMemo, useState } from 'react'
import GoalPlannerCore from '../components/GoalPlannerCore'
import api from '../utils/api'

export default function GoalPlannerPage({ monthlyData: incomingMonthly }) {
  const [goals, setGoals] = useState([])
  const [goal, setGoal] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [income, setIncome] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const [e, i, gList, gActive] = await Promise.all([
          api.get('/api/expenses'),
          api.get('/api/income'),
          api.get('/api/goals').catch(()=>({ data: [] })),
          api.get('/api/goals/active').catch(()=>({ data: null })),
        ])
        setExpenses(e.data); setIncome(i.data); setGoals(Array.isArray(gList.data)?gList.data:[]); setGoal(gActive.data)
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
      {/* List of Goals */}
      <div className="rounded-xl border border-slate-700/60 bg-slate-800/60 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="text-slate-300 font-medium">Your Goals</div>
          <button className="btn-secondary" onClick={()=>setGoal({ name:'', targetAmount:'', targetDate:'', _isNew:true })}>Add Goal</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {goals.length === 0 ? (
            <div className="text-slate-400 text-sm">No goals yet. Create one to get started.</div>
          ) : goals.map(g => (
            <div key={g._id} className={`px-3 py-2 rounded-lg border text-sm ${g.active ? 'border-cyan-500/50 text-white bg-slate-800/60' : 'border-slate-700/60 text-slate-300'}`}>
              <div className="flex items-center gap-2">
                <span className="font-medium">{g.name}</span>
                {g.active && <span className="text-xs text-cyan-300">Active</span>}
              </div>
              <div className="text-xs text-slate-400">₹{Number(g.targetAmount||0).toLocaleString()} by {g.targetDate}</div>
              <div className="mt-2 flex gap-2">
                {!g.active && <button className="btn-secondary px-2 py-1 text-xs" onClick={async()=>{ await api.post(`/api/goals/${g._id}/active`); const { data } = await api.get('/api/goals/active'); setGoal(data); const { data: gl } = await api.get('/api/goals'); setGoals(gl) }}>Set Active</button>}
                <button className="btn-secondary px-2 py-1 text-xs" onClick={()=>setGoal(g)}>Edit</button>
                <button className="btn-secondary px-2 py-1 text-xs" onClick={async()=>{ await api.delete(`/api/goals/${g._id}`); const { data: gl } = await api.get('/api/goals'); setGoals(gl); const { data } = await api.get('/api/goals/active'); setGoal(data) }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <GoalPlannerCore
        initialGoal={goal}
        monthlyData={monthlyData}
        onSave={async (g)=>{
          if (goal && goal._id && !goal._isNew) {
            const { data } = await api.put(`/api/goals/${goal._id}`, g)
            setGoal(data)
          } else {
            const { data } = await api.post('/api/goals', { ...g, active: true })
            setGoal(data)
          }
          const { data: gl } = await api.get('/api/goals'); setGoals(gl)
        }}
      />
    </div>
  )
}
