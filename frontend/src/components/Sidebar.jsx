import { Link } from 'react-router-dom'

export default function Sidebar() {
  return (
    <aside className="w-60 min-h-screen border-r border-gray-800 p-4 hidden md:block">
      <ul className="space-y-2 text-gray-300">
        <li><Link to="/" className="hover:text-accent">Home</Link></li>
        <li><Link to="/dashboard" className="hover:text-accent">Dashboard</Link></li>
        <li><Link to="/profile" className="hover:text-accent">Profile</Link></li>
        <li><Link to="/simulate" className="hover:text-accent">Investment Simulator</Link></li>
      </ul>
    </aside>
  )
}
