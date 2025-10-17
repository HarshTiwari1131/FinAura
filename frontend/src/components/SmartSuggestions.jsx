import { useMemo, useState, useEffect } from 'react'

import api from '../utils/api'

export default function SmartSuggestions({ items, loading, error, onRefresh }) {
  const [local, setLocal] = useState(items || [])
  useEffect(()=>{ setLocal(items || []) }, [items])
  const list = local || []
  const onActionClick = async (s) => {
    try {
      const t = (s?.actionType || '').toLowerCase()
      if (t === 'move_wallet') {
        await api.post('/api/ai/apply/monthly-savings-to-wallet')
      } else if (t === 'set_weekly_cap') {
        await api.post('/api/ai/apply/set-weekly-cap', s?.actionPayload || {})
      } else if (t === 'trim_categories') {
        await api.post('/api/ai/apply/trim-categories')
      }
      // Optimistically drop this suggestion
      setLocal(cur => cur.filter(x => x !== s))
      onRefresh?.()
    } catch {}
  }
  return (
    <div className="rounded-xl border card-base backdrop-blur-sm p-6">
      <div className="flex items-center justify-between">
        <div className="text-slate-300 font-semibold">Smart Suggestions</div>
        <button className="btn-secondary px-2 py-1 text-xs" onClick={onRefresh} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button>
      </div>
      {error && <div className="mt-2 text-red-400 text-sm">{String(error)}</div>}
      <ul className="mt-3 space-y-3">
        {loading ? (
          <>
            <li className="h-12 rounded-lg border animate-pulse" />
            <li className="h-12 rounded-lg border animate-pulse" />
          </>
        ) : list.length === 0 ? (
          <div className="text-slate-400 text-sm">No suggestions at the moment.</div>
        ) : (
          list.map((s, idx) => (
            <li key={idx} className="rounded-lg border p-3" style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)' }}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium" style={{ color: 'var(--text)' }}>{s.title}</div>
                  {s.detail && <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{s.detail}</div>}
                </div>
                {s.type === 'critical' && <span className="h-2 w-2 rounded-full bg-red-400 mt-1" />}
              </div>
              {s.action && (
                <button className="mt-2 text-xs text-cyan-300 underline" onClick={()=>onActionClick(s)}>
                  Action: {s.action}
                </button>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
