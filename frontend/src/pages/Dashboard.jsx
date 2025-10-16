import { useEffect, useState } from 'react'
import DashboardCard from '../components/DashboardCard'
import ExpenseForm from '../components/ExpenseForm'
import IncomeForm from '../components/IncomeForm'
import InvestmentForm from '../components/InvestmentForm'
import BudgetPlanner from '../components/BudgetPlanner'
import ChartComponent from '../components/ChartComponent'
import NotificationPanel from '../components/NotificationPanel'
import PaymentButton from '../components/PaymentButton'
import api from '../utils/api'

export default function Dashboard() {
  const [expenses, setExpenses] = useState([])
  const [income, setIncome] = useState([])
  const [ai, setAi] = useState(null)
  const [recs, setRecs] = useState(null)

  const load = async () => {
    const [e, i] = await Promise.all([
      api.get('/api/expenses'),
      api.get('/api/income')
    ])
    setExpenses(e.data); setIncome(i.data)
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

  const chartData = [
    { name: 'Income', value: totalIncome },
    { name: 'Expenses', value: totalExpenses },
    { name: 'Savings', value: savings },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <DashboardCard title="Total Income" value={`₹${totalIncome}`} accent />
        <DashboardCard title="Total Expenses" value={`₹${totalExpenses}`} />
        <DashboardCard title="Savings" value={`₹${savings}`} />
      </div>

      <ChartComponent data={chartData} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <h3 className="font-semibold">Add Expense</h3>
          <ExpenseForm onCreated={load} />
          <div className="mt-4">
            <PaymentButton amount={10000} />
          </div>
          <h3 className="font-semibold mt-6">Add Income</h3>
          <IncomeForm onCreated={load} />
          <h3 className="font-semibold mt-6">Add Investment</h3>
          <InvestmentForm onCreated={load} />
        </div>
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-800 p-4">
            <div className="font-semibold">AI Insights</div>
            <div className="text-gray-400 text-sm mt-1">
              {ai ? `Next month expenses prediction: ₹${ai.next_month_prediction} (confidence ${Math.round((ai.confidence||0)*100)}%)` : 'Loading...'}
            </div>
            <div className="text-gray-400 text-sm mt-2">
              {recs ? `Recommendation: ${recs.recommendations?.map(r=>r.type).join(', ')}` : ''}
            </div>
          </div>

          <NotificationPanel items={["Budget threshold nearing", "Upcoming bill due in 3 days"]} />
          <div>
            <h3 className="font-semibold mb-2">Budget Planner</h3>
            <BudgetPlanner />
          </div>
        </div>
      </div>
    </div>
  )
}
