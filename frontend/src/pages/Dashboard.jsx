import { useEffect, useMemo, useState } from 'react'
import DashboardCard from '../components/DashboardCard'
import ExpenseForm from '../components/ExpenseForm'
import IncomeForm from '../components/IncomeForm'
import InvestmentForm from '../components/InvestmentForm'
import BudgetPlanner from '../components/BudgetPlanner'
import PaymentButton from '../components/PaymentButton'
import GoalPlannerModal from '../components/GoalPlannerModal'
import GoalPlannerCore from '../components/GoalPlannerCore'
import GoalProgressCard from '../components/GoalProgressCard'
import SmartSuggestions from '../components/SmartSuggestions'
import api from '../utils/api'
import { motion } from 'framer-motion'
import { useNotifications } from '../context/NotificationContext'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from 'recharts'

export default function Dashboard() {
  const [expenses, setExpenses] = useState([])
  const [income, setIncome] = useState([])
  const [investments, setInvestments] = useState([])
  const [wallet, setWallet] = useState(0)
  // Removed AI Assistant state variables
  const [tab, setTab] = useState('expenses')
  const [goals, setGoals] = useState([])
  const [goal, setGoal] = useState(null)
  const [goalOpen, setGoalOpen] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [suggLoading, setSuggLoading] = useState(false)
  const [suggError, setSuggError] = useState('')
  const { addAlert } = useNotifications() || { addAlert: ()=>{} }

  const load = async () => {
    const [e, i, inv, gList, gActive, prof] = await Promise.all([
      api.get('/api/expenses'),
      api.get('/api/income'),
      api.get('/api/investment'),
      api.get('/api/goals').catch(()=>({ data: [] })),
      api.get('/api/goals/active').catch(()=>({ data: null })),
      api.get('/api/auth/profile')
    ])
    setExpenses(e.data)
    setIncome(i.data)
    setInvestments(inv.data)
    setGoals(Array.isArray(gList.data) ? gList.data : [])
    setGoal(gActive.data)
    setWallet(Number(prof.data?.walletBalance||0))
  }

  useEffect(() => { load() }, [])

  const refreshSuggestions = async () => {
    setSuggLoading(true); setSuggError('')
    try {
      const { data } = await api.get('/api/ai/suggestions', { params: { model: 'gemini' } })
      setSuggestions(Array.isArray(data?.suggestions) ? data.suggestions : [])
    } catch (e) {
      setSuggError('Failed to load suggestions')
    } finally {
      setSuggLoading(false)
    }
  }
  useEffect(() => { refreshSuggestions() }, [])
  // Expose a global refresh hook for SSE
  useEffect(() => {
    window.__refreshSuggestions = refreshSuggestions
    return () => { delete window.__refreshSuggestions }
  }, [])

  // After data loads, generate useful notifications (client-side heuristic)
  useEffect(() => {
    if (!income.length && !expenses.length) return
    const totalExpenses = expenses.reduce((s, x) => s + (x.amount||0), 0)
    const totalIncome = income.reduce((s, x) => s + (x.amount||0), 0)
    const net = totalIncome - totalExpenses
    if (net < 0) {
      addAlert({ type: 'critical', title: 'You are overspending', text: `Overspent by ₹${Math.abs(net).toLocaleString()}`, ts: new Date().toISOString() })
    }
    // Category overspend (naive): if any single category > 40% of income
    const catSums = expenses.reduce((m, e)=>{ const k=e.category||'Other'; m[k]=(m[k]||0)+(e.amount||0); return m }, {})
    const top = Object.entries(catSums).sort((a,b)=>b[1]-a[1])[0]
    if (top && totalIncome>0 && top[1] > 0.4 * totalIncome) {
      addAlert({ type: 'expense', title: `High spend on ${top[0]}`, text: `₹${Math.round(top[1]).toLocaleString()} this period`, ts: new Date().toISOString() })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [income, expenses])

  const totalExpenses = expenses.reduce((s, x) => s + (x.amount||0), 0)
  const totalIncome = income.reduce((s, x) => s + (x.amount||0), 0)
  const savings = totalIncome - totalExpenses

  const weightedAvgRoi = useMemo(() => {
    const totAmt = investments.reduce((s, x) => s + (Number(x.amount)||0), 0)
    if (!totAmt) return 0
    const numer = investments.reduce((s, x) => s + (Number(x.amount)||0) * (Number(x.roi)||0), 0)
    return (numer / totAmt) * 100
  }, [investments])

  // Helpers to group by YYYY-MM
  const ym = (d) => {
    if (!d) return 'Unknown'
    const dt = new Date(d)
    if (isNaN(dt)) return 'Unknown'
    return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`
  }

  // Monthly income vs expense
  const monthlyData = useMemo(() => {
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
  }, [income, expenses])

  // Expense breakdown by category (all-time)
  const categoryData = useMemo(() => {
    const cat = new Map()
    expenses.forEach(e => {
      const k = e.category || 'Other'
      cat.set(k, (cat.get(k)||0) + (Number(e.amount)||0))
    })
    return [...cat.entries()].map(([name, value]) => ({ name, value }))
  }, [expenses])

  // Investments by type (amount)
  const investTypeData = useMemo(() => {
    const map = new Map()
    investments.forEach(inv => {
      const k = inv.type || 'Other'
      map.set(k, (map.get(k)||0) + (Number(inv.amount)||0))
    })
    return [...map.entries()].map(([name, value]) => ({ name, value }))
  }, [investments])

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
  const item = { hidden: { opacity: 0, y: -8 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

  return (
    <div className="space-y-6">
      {/* Top Row Stats */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div variants={item}><DashboardCard title="Net Balance" value={`₹${savings.toLocaleString()}`} accent /></motion.div>
        <motion.div variants={item}><DashboardCard title="Wallet" value={`₹${wallet.toLocaleString()}`} positive /></motion.div>
        <motion.div variants={item}><DashboardCard title="Total Income" value={`₹${totalIncome.toLocaleString()}`} /></motion.div>
        <motion.div variants={item}><DashboardCard title="Total Expenses" value={`₹${totalExpenses.toLocaleString()}`} negative /></motion.div>
        <motion.div variants={item}><DashboardCard title="Investment ROI" value={`${weightedAvgRoi.toFixed(2)}%`} positive /></motion.div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Charts Area */}
        <motion.div variants={container} initial="hidden" animate="show" className="md:col-span-8 space-y-4">
          {/* Tabs */}
          <motion.div variants={item} className="flex gap-2">
            <button onClick={()=>setTab('expenses')} className={`px-3 py-1.5 rounded-lg border ${tab==='expenses' ? 'border-cyan-500/50 text-white bg-slate-800/60' : 'border-slate-700/60 text-slate-300'}`}>Expenses</button>
            <button onClick={()=>setTab('investments')} className={`px-3 py-1.5 rounded-lg border ${tab==='investments' ? 'border-cyan-500/50 text-white bg-slate-800/60' : 'border-slate-700/60 text-slate-300'}`}>Investments</button>
          </motion.div>

          {tab === 'expenses' ? (
            <>
              {/* Income vs Expense Area Chart */}
              <motion.div variants={item} className="rounded-xl border card-base backdrop-blur-sm p-6">
                <div className="text-slate-300 font-medium mb-3">Income vs Expenses</div>
                <div className="h-64">
                  <ResponsiveContainer>
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="month" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="income" stackId="1" stroke="#22D3EE" fill="#22D3EE33" name="Income" />
                      <Area type="monotone" dataKey="expenses" stackId="1" stroke="#f87171" fill="#f8717133" name="Expenses" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Expense Breakdown by Category */}
              <motion.div variants={item} className="rounded-xl border card-base backdrop-blur-sm p-6">
                <div className="text-slate-300 font-medium mb-3">Monthly Expense Breakdown</div>
                <div className="h-64">
                  <ResponsiveContainer>
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#f87171" name="Expenses" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </>
          ) : (
            <>
              {/* Investments by Type */}
              <motion.div variants={item} className="rounded-xl border card-base backdrop-blur-sm p-6">
                <div className="text-slate-300 font-medium mb-3">Investments by Type</div>
                <div className="h-64">
                  <ResponsiveContainer>
                    <BarChart data={investTypeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#22D3EE" name="Amount" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </>
          )}
        </motion.div>

        {/* AI & Goals Panel */
        }
        <motion.div variants={container} initial="hidden" animate="show" className="md:col-span-4 space-y-4">
          {/* Removed AI Recommendation and Expense Prediction cards */}

          {/* Smart Goal Planner - Progress Card and CTA */}
          <motion.div variants={item} className="space-y-3">
            {goal ? (
              <>
                <GoalProgressCard goal={goal} monthlyData={monthlyData} />
                {/* Goals Switcher */}
                {goals?.length > 1 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {goals.map(g => (
                      <button key={g._id} className={`px-3 py-1.5 rounded-lg border text-sm ${g._id===goal?._id ? 'border-cyan-500/50 text-white bg-slate-800/60' : 'border-slate-700/60 text-slate-300'}`} onClick={async()=>{ await api.post(`/api/goals/${g._id}/active`); setGoal(g); }}>
                        {g.name}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl border card-base backdrop-blur-sm p-6">
                <div className="text-slate-300 font-semibold">Set Your Financial Goal</div>
                <p className="text-slate-400 text-sm mt-1">Plan a target and follow the AI-projected path to reach it on time.</p>
                <button className="btn mt-3" onClick={()=>setGoalOpen(true)}>Create Goal</button>
              </div>
            )}
            {goal && (
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={()=>setGoalOpen(true)}>Adjust Goal</button>
                <button className="btn-secondary" onClick={async()=>{ if(goal?._id){ await api.delete(`/api/goals/${goal._id}`); await load() } }}>Delete Active</button>
                <button className="btn" onClick={()=>{ setGoalOpen(true); }}>Add New Goal</button>
              </div>
            )}
          </motion.div>

          {/* Smart Suggestions */}
          <motion.div variants={item}>
            <SmartSuggestions items={suggestions} loading={suggLoading} error={suggError} onRefresh={refreshSuggestions} />
          </motion.div>

          {/* Alerts/Notifications are global via Navbar bell */}
        </motion.div>
      </div>

      {/* Goal Planner Modal */}
      <GoalPlannerModal open={goalOpen} onClose={()=>setGoalOpen(false)}>
        <GoalPlannerCore
          initialGoal={goal}
          monthlyData={monthlyData}
          onCancel={()=>setGoalOpen(false)}
          onSave={async (g)=>{
            const { data } = await api.post('/api/goals', g)
            setGoal(data); setGoalOpen(false)
          }}
        />
      </GoalPlannerModal>

      {/* Forms Row */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={item} className="rounded-xl border card-base backdrop-blur-sm p-6">
          <h3 className="font-semibold text-slate-200">Add Expense</h3>
          <div className="mt-3"><ExpenseForm onCreated={load} /></div>
          <div className="mt-4"><PaymentButton amount={10000} /></div>
        </motion.div>
        <motion.div variants={item} className="rounded-xl border card-base backdrop-blur-sm p-6">
          <h3 className="font-semibold text-slate-200">Add Income</h3>
          <div className="mt-3"><IncomeForm onCreated={load} /></div>
        </motion.div>
        <motion.div variants={item} className="rounded-xl border card-base backdrop-blur-sm p-6">
          <h3 className="font-semibold text-slate-200">Add Investment</h3>
          <div className="mt-3"><InvestmentForm onCreated={load} /></div>
        </motion.div>
      </motion.div>
    </div>
  )
}
