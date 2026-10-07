import { createContext, useContext, useMemo, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const AuthContext = createContext(null)

const getStoredAuth = () => {
  const storedAuth = localStorage.getItem('expense_tracker_auth')

  if (!storedAuth) {
    return { session: null, user: null }
  }

  try {
    return JSON.parse(storedAuth)
  } catch {
    localStorage.removeItem('expense_tracker_auth')
    return { session: null, user: null }
  }
}

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(getStoredAuth)

  const saveAuth = ({ session, user }) => {
    const nextAuth = { session, user }
    localStorage.setItem('expense_tracker_auth', JSON.stringify(nextAuth))
    setAuth(nextAuth)
  }

  const requestAuth = async (path, body) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong')
    }

    saveAuth({
      session: data.session,
      user: data.user,
    })

    return data
  }

  const login = (email, password) => requestAuth('/api/auth/login', { email, password })

  const register = (email, password, fullName) =>
    requestAuth('/api/auth/register', {
      email,
      password,
      full_name: fullName,
    })

  const logout = async () => {
    const accessToken = auth.session?.access_token

    if (accessToken) {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).catch(() => {})
    }

    localStorage.removeItem('expense_tracker_auth')
    setAuth({ session: null, user: null })
  }

  const value = useMemo(
    () => ({
      session: auth.session,
      user: auth.user,
      isAuthenticated: Boolean(auth.session?.access_token),
      login,
      register,
      logout,
    }),
    [auth]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
