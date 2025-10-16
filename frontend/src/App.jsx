import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import InvestmentSimulator from './pages/InvestmentSimulator'
import ExpensesList from './pages/ExpensesList'
import IncomeList from './pages/IncomeList'
import InvestmentList from './pages/InvestmentList'
import PaymentPage from './pages/PaymentPage'
import GoalPlanner from './pages/GoalPlanner'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import ErrorBoundary from './components/ErrorBoundary'

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <div className="min-h-screen transition-colors duration-500">
            <Navbar />
            <div className="flex">
              <Sidebar />
              <main className="flex-1 p-6">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                  <Route path="/profile" element={<PrivateRoute><ErrorBoundary><Profile /></ErrorBoundary></PrivateRoute>} />
                  <Route path="/simulate" element={<PrivateRoute><InvestmentSimulator /></PrivateRoute>} />
                  <Route path="/expenses" element={<PrivateRoute><ExpensesList /></PrivateRoute>} />
                  <Route path="/income" element={<PrivateRoute><IncomeList /></PrivateRoute>} />
                  <Route path="/investments" element={<PrivateRoute><InvestmentList /></PrivateRoute>} />
                  <Route path="/pay" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
                  <Route path="/goals" element={<PrivateRoute><GoalPlanner /></PrivateRoute>} />
                </Routes>
              </main>
            </div>
          </div>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
