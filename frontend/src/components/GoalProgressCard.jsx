import { useMemo } from 'react'

const ymStr = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
const monthDiff = (from, to) => (to.getFullYear()-from.getFullYear())*12 + (to.getMonth()-from.getMonth())

export default function GoalProgressCard({ goal, monthlyData }) {
  if (!goal) return null
  const target = Number(goal.targetAmount)||0

  const currentSaved = useMemo(() => {
    if (!monthlyData || !monthlyData.length) return 0
    // cumulative net savings till latest month
    return monthlyData.reduce((acc, row) => acc + (Number(row.income)||0) - (Number(row.expenses)||0), 0)
  }, [monthlyData])

  const pct = target > 0 ? Math.min(100, Math.round((currentSaved/target)*100)) : 0

  const now = new Date()
  const tgt = goal.targetDate ? new Date(goal.targetDate) : null
  const monthsRemaining = tgt ? Math.max(0, (tgt.getFullYear()-now.getFullYear())*12 + (tgt.getMonth()-now.getMonth())) : 0

  const suggestedMonthly = monthsRemaining>0 ? Math.max(0, (target - currentSaved)/monthsRemaining) : Math.max(0, target - currentSaved)

  const radius = 42
  const circumference = 2 * Math.PI * radius
  const progress = (pct/100) * circumference

  // Compute ideal progress to date based on linear path from start to target date
  const startDate = goal.createdAt ? new Date(goal.createdAt) : (monthlyData?.length ? new Date(monthlyData[0].month + '-01') : new Date(now.getFullYear(), now.getMonth(), 1))
  const totalMonths = tgt ? Math.max(1, monthDiff(new Date(startDate.getFullYear(), startDate.getMonth(), 1), new Date(tgt.getFullYear(), tgt.getMonth(), 1))) : 1
  const elapsedMonths = Math.max(0, Math.min(totalMonths, monthDiff(new Date(startDate.getFullYear(), startDate.getMonth(), 1), new Date(now.getFullYear(), now.getMonth(), 1))))
  const idealNow = target * (elapsedMonths / totalMonths)
  const aheadBehind = currentSaved - idealNow
  const ahead = aheadBehind >= 0

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/60 backdrop-blur-sm p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-slate-200 font-semibold">{goal.name || 'Goal'}</div>
          <div className="text-xs text-slate-400">Target: ₹{target.toLocaleString()} by {goal.targetDate || '—'}</div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-5">
        <svg width="120" height="120" className="-rotate-90">
          <circle cx="60" cy="60" r={radius} stroke="#374151" strokeWidth="10" fill="transparent" />
          <circle cx="60" cy="60" r={radius} stroke={ahead ? '#10B981' : '#EF4444'} strokeWidth="10" fill="transparent" strokeDasharray={`${progress} ${circumference}`} strokeLinecap="round" />
        </svg>
        <div className="rotate-0 -ml-24">
          <div className={`text-2xl font-bold ${ahead ? 'text-green-400' : 'text-red-400'}`}>{pct}%</div>
        </div>
        <div className="flex-1">
          <div className="text-slate-300">Months Remaining: <span className="text-slate-100 font-semibold">{monthsRemaining}</span></div>
          <div className="text-slate-300">Status: {ahead ? (
            <span className="text-green-400 font-medium">Ahead by ₹{Math.abs(aheadBehind).toLocaleString()}</span>
          ) : (
            <span className="text-red-400 font-medium">Behind by ₹{Math.abs(aheadBehind).toLocaleString()}</span>
          )}</div>
        </div>
      </div>
    </div>
  )
}
