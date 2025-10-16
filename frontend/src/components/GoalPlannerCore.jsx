import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts'

// Helpers
const ymStr = (d) => {
  const dt = new Date(d)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
}

const monthDiff = (from, to) => {
  const a = new Date(from.getFullYear(), from.getMonth(), 1)
  const b = new Date(to.getFullYear(), to.getMonth(), 1)
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
}

const enumerateMonths = (startYm, endYm) => {
  const [sy, sm] = startYm.split('-').map(Number)
  const [ey, em] = endYm.split('-').map(Number)
  const start = new Date(sy, sm - 1, 1)
  const end = new Date(ey, em - 1, 1)
  const months = []
  const n = monthDiff(start, end)
  for (let i = 0; i <= n; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1)
    months.push(ymStr(d))
  }
  return months
}

export default function GoalPlannerCore({
  initialGoal,
  monthlyData, // [{ month: 'YYYY-MM', income, expenses }]
  onSave,
  onCancel,
}) {
  const [name, setName] = useState(initialGoal?.name || '')
  const [targetAmount, setTargetAmount] = useState(initialGoal?.targetAmount || '')
  const [targetDate, setTargetDate] = useState(initialGoal?.targetDate || '')

  useEffect(() => {
    // keep form in sync if initialGoal changes
    setName(initialGoal?.name || '')
    setTargetAmount(initialGoal?.targetAmount || '')
    setTargetDate(initialGoal?.targetDate || '')
  }, [initialGoal])

  // Build a map for quick monthly lookup
  const monthlyMap = useMemo(() => {
    const m = new Map()
    ;(monthlyData || []).forEach(row => {
      m.set(row.month, (Number(row.income) || 0) - (Number(row.expenses) || 0))
    })
    return m
  }, [monthlyData])

  const now = new Date()
  const currentYm = ymStr(now)
  const firstDataYm = useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) return currentYm
    return monthlyData.map(d => d.month).sort()[0]
  }, [monthlyData, currentYm])

  // Derived metrics
  const targetDt = targetDate ? new Date(targetDate) : null
  const monthsRemaining = useMemo(() => {
    if (!targetDt) return 0
    const raw = monthDiff(new Date(now.getFullYear(), now.getMonth(), 1), new Date(targetDt.getFullYear(), targetDt.getMonth(), 1))
    return Math.max(0, raw)
  }, [targetDt])

  // Compute cumulative actual savings per month
  const chartData = useMemo(() => {
    if (!targetDate) return []
    const endYm = ymStr(targetDt)
    const months = enumerateMonths(firstDataYm, endYm)
    let actualCum = 0
    const res = []
    // accumulate up to last known month
    const lastKnownYm = (monthlyData || []).map(d => d.month).sort().slice(-1)[0]
    months.forEach((mYm) => {
      const delta = monthlyMap.get(mYm) || 0
      if (lastKnownYm && mYm <= lastKnownYm) {
        actualCum += delta
      }
      // ideal curve will be filled below once we know suggestedMonthly
      res.push({ month: mYm, actual: actualCum, ideal: null })
    })
    return res
  }, [firstDataYm, targetDate, targetDt, monthlyData, monthlyMap])

  const currentSaved = useMemo(() => {
    if (!chartData.length) return 0
    return chartData[chartData.length - 1]?.actual ?? 0
  }, [chartData])

  const target = Number(targetAmount) || 0
  const remainingAmount = Math.max(0, target - currentSaved)
  const suggestedMonthly = monthsRemaining > 0 ? remainingAmount / monthsRemaining : remainingAmount

  // Fill ideal values starting from current month position
  const projectedData = useMemo(() => {
    if (!chartData.length) return []
    let startIndex = chartData.findIndex(d => d.month === currentYm)
    if (startIndex === -1) {
      // if current month not in range, choose first index beyond last known month
      startIndex = Math.max(0, chartData.findIndex(d => d.month > currentYm))
    }
    let runningIdeal = currentSaved
    return chartData.map((d, idx) => {
      let idealVal = d.ideal
      if (idx >= startIndex) {
        // from current onwards, increase by suggested monthly
        if (idx === startIndex) {
          idealVal = runningIdeal
        } else {
          runningIdeal += suggestedMonthly
          idealVal = runningIdeal
        }
      } else {
        idealVal = null
      }
      return { ...d, ideal: idealVal }
    })
  }, [chartData, currentYm, currentSaved, suggestedMonthly])

  const save = (e) => {
    e?.preventDefault?.()
    const payload = {
      name: name || 'My Goal',
      targetAmount: Number(targetAmount) || 0,
      targetDate: targetDate,
      createdAt: initialGoal?.createdAt || new Date().toISOString(),
    }
    onSave?.(payload)
  }

  return (
    <div className="space-y-5">
      {/* Form */}
      <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="block">
          <div className="text-xs text-slate-400 mb-1">Goal Name</div>
          <input
            className="w-full rounded-lg bg-slate-700/70 border border-slate-700 text-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
            placeholder="Dream Car, House Downpayment..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <div className="text-xs text-slate-400 mb-1">Target Amount (₹)</div>
          <input
            type="number"
            min="0"
            className="w-full rounded-lg bg-slate-700/70 border border-slate-700 text-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <div className="text-xs text-slate-400 mb-1">Target Date</div>
          <input
            type="month"
            className="w-full rounded-lg bg-slate-700/70 border border-slate-700 text-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            required
          />
        </label>
        <div className="md:col-span-3 flex justify-end gap-2">
          {onCancel && <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>}
          <button type="submit" className="btn">Save Goal</button>
        </div>
      </form>

      {/* AI Projection */}
      {targetDate && (
        <motion.div layout className="rounded-xl border border-slate-700/60 bg-slate-800/60 backdrop-blur-sm p-4">
          <div className="text-slate-300 font-semibold">AI Projection</div>
          <p className="mt-2 text-slate-400 text-sm">
            To reach <span className="text-slate-200 font-medium">₹{(Number(targetAmount)||0).toLocaleString()}</span> by <span className="text-slate-200 font-medium">{targetDate}</span>, you need to save
            {' '}
            <span className="text-white font-bold">₹{Math.ceil(suggestedMonthly).toLocaleString()}</span>
            {' '}per month.
          </p>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <LineChart data={projectedData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ideal" name="Required" stroke="#22D3EE" strokeWidth={2} dot={false} strokeDasharray="6 6" connectNulls isAnimationActive animationDuration={300} />
                <Line type="monotone" dataKey="actual" name="Actual" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive animationDuration={300} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  )
}
