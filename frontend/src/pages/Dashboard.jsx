import { useEffect, useMemo, useState } from 'react'
import DashboardCard from '../components/DashboardCard'
import ExpenseForm from '../components/ExpenseForm'
import IncomeForm from '../components/IncomeForm'
import InvestmentForm from '../components/InvestmentForm'
import BudgetPlanner from '../components/BudgetPlanner'
import NotificationPanel from '../components/NotificationPanel'
import PaymentButton from '../components/PaymentButton'
import GoalPlannerModal from '../components/GoalPlannerModal'
import GoalPlannerCore from '../components/GoalPlannerCore'
import GoalProgressCard from '../components/GoalProgressCard'
import api from '../utils/api'
import { motion } from 'framer-motion'
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
  const [ai, setAi] = useState(null)
  const [recs, setRecs] = useState(null)
  const [tab, setTab] = useState('expenses')
  const [goal, setGoal] = useState(() => {
    try {
      const raw = localStorage.getItem('finaura_goal')
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })
  const [goalOpen, setGoalOpen] = useState(false)

  const load = async () => {
    const [e, i, inv] = await Promise.all([
      api.get('/api/expenses'),
      api.get('/api/income'),
      api.get('/api/investment')
    ])
    setExpenses(e.data)
    setIncome(i.data)
    setInvestments(inv.data)
    const [p, r] = await Promise.all([
      api.get('/api/ai/expense-predict'),
      api.get('/api/ai/investment-recommend')
    ])
    setAi(p.data); setRecs(r.data)
  }

  useEffect(() => { load() }, [])

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
          {/* AI Recommendation */}
          <motion.div variants={item} className="rounded-xl border card-base backdrop-blur-sm p-6 border-l-4 border-l-cyan-400">
            <div className="text-slate-300 font-semibold">AI Recommendation</div>
            <p className="text-slate-400 text-sm mt-2">
              {recs ? recs.recommendations?.map((r,i)=>`${r.type}${r.riskLevel?` (${r.riskLevel})`:''}`).join(', ') : 'Loading...'}
            </p>
          </motion.div>

          {/* Expense Prediction */}
          <motion.div variants={item} className="rounded-xl border card-base backdrop-blur-sm p-6 border-l-4 border-l-cyan-400">
            <div className="text-slate-300 font-semibold">Expense Prediction</div>
            <p className="text-slate-400 text-sm mt-2">
              {ai ? `Next month: ₹${(ai.next_month_prediction||0).toLocaleString()} (confidence ${Math.round((ai.confidence||0)*100)}%)` : 'Loading...'}
            </p>
          </motion.div>

          {/* Smart Goal Planner - Progress Card and CTA */}
          <motion.div variants={item} className="space-y-3">
            {goal ? (
              <GoalProgressCard goal={goal} monthlyData={monthlyData} />
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
                <button className="btn-secondary" onClick={()=>{ localStorage.removeItem('finaura_goal'); setGoal(null) }}>Clear</button>
              </div>
            )}
          </motion.div>

          {/* Alerts/Notifications */}
          <motion.div variants={item}>
            <NotificationPanel items={["Budget threshold nearing", "Upcoming bill due in 3 days"]} />
          </motion.div>
        </motion.div>
      </div>

      {/* Goal Planner Modal */}
      <GoalPlannerModal open={goalOpen} onClose={()=>setGoalOpen(false)}>
        <GoalPlannerCore
          initialGoal={goal}
          monthlyData={monthlyData}
          onCancel={()=>setGoalOpen(false)}
          onSave={(g)=>{ localStorage.setItem('finaura_goal', JSON.stringify(g)); setGoal(g); setGoalOpen(false) }}
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
