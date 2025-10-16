import { useState } from 'react'
import ChartComponent from '../components/ChartComponent'

export default function InvestmentSimulator() {
  const [amount, setAmount] = useState(10000)
  const [rate, setRate] = useState(0.12)
  const [years, setYears] = useState(5)

  const data = Array.from({ length: years + 1 }, (_, i) => {
    const value = amount * Math.pow(1 + rate, i)
    return { name: `Y${i}`, value: Math.round(value) }
  })

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h2 className="text-2xl font-semibold">Investment Simulator</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <label className="block">
          <div className="text-sm text-gray-400">Amount</div>
          <input className="input w-full" type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} />
        </label>
        <label className="block">
          <div className="text-sm text-gray-400">Rate (0.12)</div>
          <input className="input w-full" step="0.01" type="number" value={rate} onChange={e=>setRate(Number(e.target.value))} />
        </label>
        <label className="block">
          <div className="text-sm text-gray-400">Years</div>
          <input className="input w-full" type="number" value={years} onChange={e=>setYears(Number(e.target.value))} />
        </label>
      </div>
      <ChartComponent data={data} />
    </div>
  )
}
