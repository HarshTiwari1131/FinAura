import { useState } from 'react'
import api from '../utils/api'

export default function Chat() {
  const [q, setQ] = useState('Can I afford a phone for ₹25000 next month?')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const ask = async () => {
    setError(''); setLoading(true)
    try {
      const { data } = await api.get('/api/ai/query', { params: { q } })
      setData(data)
    } catch (e) {
      setError(e?.response?.data?.message || 'Request failed')
    } finally { setLoading(false) }
  }

  const runInsights = async () => {
    setError(''); setLoading(true)
    try {
      const { data } = await api.get('/api/ai/insights')
      setData(data)
    } catch (e) {
      setError(e?.response?.data?.message || 'Request failed')
    } finally { setLoading(false) }
  }

  const runBudget = async () => {
    setError(''); setLoading(true)
    try {
      const { data } = await api.post('/api/ai/plan-budget')
      setData(data)
    } catch (e) {
      setError(e?.response?.data?.message || 'Request failed')
    } finally { setLoading(false) }
  }

  const runInvest = async () => {
    setError(''); setLoading(true)
    try {
      const { data } = await api.get('/api/ai/investment-recommend')
      setData(data)
    } catch (e) {
      setError(e?.response?.data?.message || 'Request failed')
    } finally { setLoading(false) }
  }

  const runPredict = async () => {
    setError(''); setLoading(true)
    try {
      const { data } = await api.get('/api/ai/expense-predict')
      setData(data)
    } catch (e) {
      setError(e?.response?.data?.message || 'Request failed')
    } finally { setLoading(false) }
  }

  const runGoal = async () => {
    setError(''); setLoading(true)
    try {
      const { data } = await api.get('/api/ai/goal-progress')
      setData(data)
    } catch (e) {
      setError(e?.response?.data?.message || 'Request failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Agentic AI Chat</h1>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input className="input w-full" value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Ask about your finances..." />
        <button className="btn" onClick={ask} disabled={loading}>{loading? 'Thinking...' : 'Ask'}</button>
        <div className="flex gap-2 flex-wrap">
          <button className="btn-secondary" onClick={runInsights} disabled={loading}>Insights</button>
          <button className="btn-secondary" onClick={runBudget} disabled={loading}>Plan Budget</button>
          <button className="btn-secondary" onClick={runInvest} disabled={loading}>Invest Plan</button>
          <button className="btn-secondary" onClick={runPredict} disabled={loading}>Predict Spend</button>
          <button className="btn-secondary" onClick={runGoal} disabled={loading}>Goal Progress</button>
        </div>
      </div>
      {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
      {data && (
        <div className="mt-6 rounded-xl border card-base p-4">
          <div className="font-medium" style={{ color: 'var(--text)' }}>Final Answer</div>
          <div className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{String(data.final_answer || data.reply || data.advice || data.insight || '')}</div>

          {data.categories && (
            <div className="mt-4">
              <div className="font-medium" style={{ color: 'var(--text)' }}>Budget Categories</div>
              <ul className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                {Object.entries(data.categories).map(([k,v]) => (
                  <li key={k} className="flex justify-between"><span>{k}</span><span>{Math.round(v*100)}%</span></li>
                ))}
              </ul>
              {data.tips && <div className="mt-2 italic">Tip: {data.tips}</div>}
            </div>
          )}

          {data.plan && Array.isArray(data.plan) && (
            <div className="mt-4">
              <div className="font-medium" style={{ color: 'var(--text)' }}>Investment Plan</div>
              <ul className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                {data.plan.map((p,i)=> (
                  <li key={i} className="flex justify-between">
                    <span>{p.type} - {p.instrument}</span>
                    <span>₹{p.amount?.toLocaleString?.() ?? p.suggested_amount?.toLocaleString?.()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.recommendation && (
            <div className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>Recommendation: {data.recommendation}</div>
          )}

          {Array.isArray(data.agent_calls) && data.agent_calls.length > 0 && (
            <div className="mt-4">
              <div className="font-medium" style={{ color: 'var(--text)' }}>Agent Calls</div>
              <ul className="mt-2 space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                {data.agent_calls.map((c, i) => (
                  <li key={i} className="rounded border p-2" style={{ borderColor: 'var(--border)' }}>
                    <div><b>Agent:</b> {c.agent}</div>
                    <div><b>Input:</b> {typeof c.input === 'string' ? c.input : JSON.stringify(c.input)}</div>
                    <div><b>Output:</b> {typeof c.output === 'string' ? c.output : JSON.stringify(c.output)}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!data.agent_calls && (
            <pre className="mt-4 text-xs overflow-auto" style={{ color: 'var(--text-muted)' }}>{JSON.stringify(data, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  )
}
