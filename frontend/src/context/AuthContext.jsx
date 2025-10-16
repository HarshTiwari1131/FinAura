import React, { createContext, useContext, useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

const AuthCtx = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('access_token'))
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (token) {
      localStorage.setItem('access_token', token)
      try { setUser(jwtDecode(token)) } catch {}
    } else {
      localStorage.removeItem('access_token')
      setUser(null)
    }
  }, [token])

  const logout = () => setToken(null)

  return (
    <AuthCtx.Provider value={{ token, setToken, user, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
