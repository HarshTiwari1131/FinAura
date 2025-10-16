import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold">FinAura</h1>
      <p className="text-gray-400 mt-2">Your AI-Powered Path to Smarter Money.</p>
      <div className="mt-6 space-x-3">
        <Link to="/signup" className="btn">Get Started</Link>
        <Link to="/login" className="btn-secondary">Login</Link>
      </div>
    </div>
  )
}
