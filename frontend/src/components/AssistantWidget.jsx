import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function AssistantWidget() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [model, setModel] = useState('gemini')
  const [msgs, setMsgs] = useState([])
  const [busy, setBusy] = useState(false)
  const key = useMemo(()=> user ? `assistant_${user.sub}` : 'assistant_guest', [user])
  const bottomRef = useRef(null)

  useEffect(()=>{
    try { const saved = JSON.parse(localStorage.getItem(key)||'[]'); setMsgs(saved) } catch {}
  }, [key])
  useEffect(()=>{ localStorage.setItem(key, JSON.stringify(msgs)) }, [key, msgs])
  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, open])

  const ask = async (text) => {
    if (!text?.trim()) return
    const q = text.trim()
    setMsgs(m => [...m, { role:'user', content:q, ts: Date.now() }])
    setInput(''); setBusy(true)
    try {
      const { data } = await api.get('/api/ai/chat', { params: { q, model } })
      const answer = data.reply || data.final_answer || JSON.stringify(data)
      setMsgs(m => [...m, { role:'assistant', content:answer, ts: Date.now() }])
    } catch (e) {
      setMsgs(m => [...m, { role:'assistant', content:'Sorry, I could not process that right now.', ts: Date.now(), error: true }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-cyan-500 hover:bg-cyan-400 shadow-lg grid place-items-center text-white"
        title="Ask Assistant"
        onClick={()=>setOpen(o=>!o)}
      >
        {/* Assistant icon */}
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3a9 9 0 0 0-9 9 9 9 0 0 0 6.2 8.5l.3.1c.5.2.9-.2.8-.7-.1-.6-.2-1.6 0-2.1.2-.6 1.3-1 1.3-1s-1.1-.5-1.6-1.6c-.4-.9 0-2 .3-2.3 0 0 1 .1 1.6 1.1.5.8 1.5 1.1 2.4.8.2-.5.6-1 .9-1.2-2.9-.3-4-2.1-4-3.9 0-1.1.4-2.1 1.2-2.9-.4-1.2 0-2.2.1-2.4 1.5-.1 2.6 1 2.6 1s.7-.2 1.8-.2 2 .2 2 .2 1.1-1.1 2.6-1c.1.2.5 1.2.1 2.4.8.8 1.2 1.8 1.2 2.9 0 1.8-1.1 3.6-4 3.9.6.4 1 1.5 1 2.2 0 1.6-.1 3.3-.1 3.6 0 .3.2.6.6.5l.3-.1A9 9 0 0 0 21 12a9 9 0 0 0-9-9z"/>
        </svg>
      </button>

      {/* Slide-over chat */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/40" onClick={()=>setOpen(false)} />
            <motion.div initial={{ x: 360 }} animate={{ x: 0 }} exit={{ x: 360 }} transition={{ type:'spring', stiffness: 260, damping: 26 }} className="absolute right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-700/60 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-slate-700/60">
                <div className="flex items-center gap-2 text-slate-200">
                  <span className="inline-grid place-items-center h-8 w-8 rounded-full bg-cyan-500 text-white">AI</span>
                  <span className="font-semibold">Assistant</span>
                </div>
                <div className="flex items-center gap-2">
                  <select className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-sm" value={model} onChange={e=>setModel(e.target.value)}>
                    <option value="gemini">Gemini</option>
                    <option value="longcat">Longcat</option>
                  </select>
                  <button className="text-slate-400 hover:text-slate-200" onClick={()=>setOpen(false)}>✕</button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgs.length === 0 && (
                  <div className="text-slate-400 text-sm">Ask anything about your finances, budgets, goals, or investments.</div>
                )}
                {msgs.map((m, i) => (
                  <div key={i} className={`max-w-[85%] ${m.role==='user' ? 'ml-auto' : ''}`}>
                    <div className={`px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${m.role==='user' ? 'bg-cyan-600 text-white' : (m.error ? 'bg-red-900/50 text-red-200' : 'bg-slate-800 text-slate-200')}`}>{m.content}</div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form className="p-3 border-t border-slate-700/60 flex gap-2" onSubmit={(e)=>{ e.preventDefault(); ask(input) }}>
                <input className="input flex-1" placeholder="Ask about your financial reports..." value={input} onChange={e=>setInput(e.target.value)} disabled={busy} />
                <button className="btn" disabled={busy || !input.trim()}>{busy? 'Asking...' : 'Ask'}</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
