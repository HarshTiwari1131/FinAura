import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import InvestmentSimulator from './pages/InvestmentSimulator'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/simulate" element={<PrivateRoute><InvestmentSimulator /></PrivateRoute>} />
            </Routes>
          </main>
        </div>
      </div>
    </AuthProvider>
  )
}
