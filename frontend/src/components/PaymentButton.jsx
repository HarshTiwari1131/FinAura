import { useEffect } from 'react'
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

export default function PaymentButton({ amount = 5000 }) { // amount in paise
  useEffect(() => { loadScript('https://checkout.razorpay.com/v1/checkout.js') }, [])

  const pay = async () => {
    const { data: order } = await api.post('/api/payment/initiate', null, { params: { amount } })
    const options = {
      key: order.key,
      amount: order.amount,
      currency: 'INR',
      name: 'FinAura',
      description: 'Wallet Top-up',
      order_id: order.id,
      handler: async function (response) {
        await api.post('/api/payment/verify', null, { params: {
          order_id: response.razorpay_order_id,
          payment_id: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        }})
        alert('Payment successful')
      },
      theme: { color: '#1E40AF' }
    }
    // eslint-disable-next-line no-undef
    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  return <button className="btn" onClick={pay}>Add Money</button>
}
