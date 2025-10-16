import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'

function gaussianRandom() {
  // Box-Muller transform
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

export default function InvestmentSimulator() {
  const [capital, setCapital] = useState(100000)
  const [type, setType] = useState('stock') // stock | crypto | mf
  const [risk, setRisk] = useState(5) // 1..10
  const [years, setYears] = useState(5)
  const [loading, setLoading] = useState(false)
  const [simKey, setSimKey] = useState(0)

  const params = useMemo(() => {
    // Baseline annual return and volatility per type
    if (type === 'crypto') return { mu: 0.25, sigma: 0.8 }
    if (type === 'mf') return { mu: 0.08, sigma: 0.12 }
    return { mu: 0.10, sigma: 0.2 } // stock default
  }, [type])

  const { series, finalValue, cagr, growthPct } = useMemo(() => {
    const months = Math.max(1, Math.round(years * 12))
    const dt = 1 / 12
    const riskFactor = (risk / 5) // 0.2..2.0 scaling roughly
    const mu = params.mu
    const sigma = params.sigma * riskFactor
    let value = Number(capital) || 0

    const arr = []
    const start = new Date()
    for (let m = 0; m <= months; m++) {
      const d = new Date(start)
      d.setMonth(d.getMonth() + m)
      if (m > 0) {
        // Geometric Brownian Motion step approximation
        const z = gaussianRandom()
        const r = (mu - 0.5 * sigma * sigma) * dt + sigma * Math.sqrt(dt) * z
        value = value * Math.exp(r)
      }
      arr.push({
        date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        value: Math.max(0, Math.round(value))
      })
    }
    const fv = value
    const yr = Math.max(0.0001, years)
    const cagrVal = Math.pow(fv / Math.max(1, capital), 1 / yr) - 1
    const gp = (fv / Math.max(1, capital) - 1) * 100
    return { series: arr, finalValue: fv, cagr: cagrVal, growthPct: gp }
  }, [capital, years, params, risk, simKey])

  const run = async () => {
    setLoading(true)
    // Simulate a dramatic loading before re-key to retrigger chart animation
    await new Promise(r => setTimeout(r, 800))
    setSimKey(k => k + 1)
    setLoading(false)
  }

  const startDate = series?.[0]?.date
  const endDate = series?.[series.length - 1]?.date
  const gain = finalValue - capital

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-semibold text-white">Investment Simulator</h2>
        <div className="text-sm text-slate-400">Start: {startDate || '--'} • End: {endDate || '--'} • Growth: {growthPct.toFixed(2)}%</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Controls Panel */}
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="md:col-span-3 rounded-xl border border-slate-700/50 bg-slate-800 p-6">
          <div className="space-y-4">
            <label className="block">
              <div className="text-xs text-slate-400 mb-1">Starting Capital (₹)</div>
              <input className="w-full font-mono rounded-lg bg-slate-700/70 border border-slate-700 text-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400" type="number" value={capital} onChange={e=>setCapital(Number(e.target.value))} />
            </label>

            <label className="block">
              <div className="text-xs text-slate-400 mb-1">Investment Type</div>
              <select className="w-full rounded-lg bg-slate-700/70 border border-slate-700 text-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400" value={type} onChange={e=>setType(e.target.value)}>
                <option value="stock">Stocks</option>
                <option value="crypto">Crypto</option>
                <option value="mf">Mutual Funds</option>
              </select>
            </label>

            <label className="block">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Risk Level</span>
                <span className="font-mono text-slate-300">{risk}</span>
              </div>
              <input className="w-full" type="range" min="1" max="10" value={risk} onChange={e=>setRisk(Number(e.target.value))} />
            </label>

            <label className="block">
              <div className="text-xs text-slate-400 mb-1">Time Horizon (Years)</div>
              <input className="w-full font-mono rounded-lg bg-slate-700/70 border border-slate-700 text-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400" type="number" min="1" value={years} onChange={e=>setYears(Number(e.target.value))} />
            </label>

            <motion.button whileTap={{ scale: 0.98 }} onClick={run} className="btn w-full">Run Simulation</motion.button>
          </div>
        </motion.div>

        {/* Visualizer Panel */}
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }} className="relative md:col-span-9 rounded-xl border border-slate-700/50 bg-slate-800/60 backdrop-blur-sm p-6">
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 z-10 grid place-items-center bg-slate-900/40 backdrop-blur-sm rounded-xl">
              <div className="h-10 w-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            </div>
          )}
          <div className="h-[360px]">
            <ResponsiveContainer>
              <AreaChart data={series} key={simKey}>
                <defs>
                  <linearGradient id="simCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#22D3EE" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#9ca3af" hide={false} />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#22D3EE" fill="url(#simCyan)" strokeWidth={2} isAnimationActive animationDuration={700} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Metrics */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-3">
              <div className="text-xs text-slate-400">Final Value</div>
              <div className="font-semibold text-slate-100">₹{Math.round(finalValue).toLocaleString()}</div>
            </div>
            <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-3">
              <div className="text-xs text-slate-400">Net {gain >=0 ? 'Gain' : 'Loss'}</div>
              <div className={`font-semibold ${gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>₹{Math.abs(Math.round(gain)).toLocaleString()}</div>
            </div>
            <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-3">
              <div className="text-xs text-slate-400">CAGR</div>
              <div className={`font-semibold ${cagr >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{(cagr*100).toFixed(2)}%</div>
            </div>
            <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-3">
              <div className="text-xs text-slate-400">Simulation Risk Score</div>
              <div className="font-semibold text-slate-100">{Math.round((risk/10)*100)}</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
