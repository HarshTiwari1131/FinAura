import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'

function loadScript(src) {
  return new Promise((resolve) => {
    const s = document.createElement('script')
    s.src = src
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

export default function PaymentPage() {
  const [amount, setAmount] = useState('1000') // rupees
  const [method, setMethod] = useState('upi')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(()=>{ loadScript('https://checkout.razorpay.com/v1/checkout.js') }, [])

  const canPay = useMemo(()=> Number(amount) > 0, [amount])

  const startPayment = async () => {
    setLoading(true)
    try {
      // amount is in paise for backend/razorpay
      const paise = Math.round(Number(amount) * 100)
      const { data: order } = await api.post('/api/payment/initiate', null, { params: { amount: paise, method } })
      const options = {
        key: order.key,
        amount: order.amount,
        currency: 'INR',
        name: 'FinAura',
        description: 'Wallet Top-up',
        order_id: order.id,
        notes: { method },
        handler: async function (response) {
          await api.post('/api/payment/verify', null, { params: {
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          }})
          setLoading(false)
          setSuccess(true)
          setTimeout(()=>{
            setSuccess(false)
            // Navigate back to dashboard
            window.location.href = '/dashboard'
          }, 1200)
        },
        theme: { color: '#1E40AF' },
        modal: { ondismiss: ()=> setLoading(false) }
      }
      // eslint-disable-next-line no-undef
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  return (
    <div className="w-full flex items-center justify-center">
      <div className="w-full max-w-lg rounded-xl border border-slate-700/60 bg-slate-800/60 backdrop-blur-sm p-6">
        {/* Security Assurance */}
        <div className="flex items-center gap-2 text-slate-300">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V7l-8-4-8 4v5c0 6 8 10 8 10z"/></svg>
          <span>Secure Transaction powered by Razorpay</span>
        </div>

        {/* Amount */}
        <div className="mt-4">
          <label className="block text-xs text-slate-400 mb-1">Amount (₹)</label>
          <input className="w-full font-mono text-xl font-semibold rounded-lg bg-slate-700/70 border border-slate-700 text-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" type="number" min="1" step="1" value={amount} onChange={e=>setAmount(e.target.value)} />
        </div>

        {/* Methods */}
        <div className="mt-4">
          <div className="text-xs text-slate-400 mb-2">Payment Method</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id:'upi', label:'UPI' },
              { id:'card', label:'Card' },
              { id:'netbanking', label:'Net Banking' },
            ].map(m => (
              <button key={m.id} onClick={()=>setMethod(m.id)} className={`rounded-lg border px-3 py-2 ${method===m.id ? 'border-cyan-400 bg-slate-900/60 text-white' : 'border-slate-700/60 text-slate-300'}`}>{m.label}</button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button disabled={!canPay} onClick={startPayment} className={`px-4 py-2 rounded-lg text-white ${canPay ? 'bg-blue-700 hover:bg-blue-600' : 'bg-slate-700 cursor-not-allowed'}`}>Pay Now</button>
        </div>
      </div>

      {/* Processing overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              <div className="text-slate-200">Processing...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success fullscreen */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="flex flex-col items-center gap-4">
              <div className="h-20 w-20 rounded-full grid place-items-center bg-emerald-500/20 border border-emerald-400/40">
                <svg viewBox="0 0 24 24" className="h-10 w-10 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="text-emerald-300 text-lg">Payment Successful</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
