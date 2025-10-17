import api from '../utils/api'

export default function PaymentButton({ amount = 5000 }) { // amount in paise
  const pay = async () => {
    const { data: session } = await api.post('/api/payment/initiate', null, { params: { amount } })
    if (session?.url) {
      window.location.href = session.url
    } else {
      alert('Failed to create Stripe session')
    }
  }

  return <button className="btn" onClick={pay}>Add Money</button>
}
