import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const AuthContext = createContext(null)

const getStoredAuth = () => {
  const storedAuth = localStorage.getItem('expense_tracker_auth')

  if (!storedAuth) {
    return { session: null, user: null, profile: null }
  }

  try {
    return JSON.parse(storedAuth)
  } catch {
    localStorage.removeItem('expense_tracker_auth')
    return { session: null, user: null, profile: null }
  }
}

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(getStoredAuth)

  const saveAuth = ({ session, user, profile = null }) => {
    const nextAuth = { session, user, profile }
    localStorage.setItem('expense_tracker_auth', JSON.stringify(nextAuth))
    setAuth(nextAuth)
  }

  const fetchProfile = useCallback(
    async (accessToken = auth.session?.access_token) => {
      if (!accessToken) {
        return null
      }

      const response = await fetch(`${API_BASE_URL}/api/profile/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        if (import.meta.env.DEV) {
          console.error('Profile request failed:', data)
        }

        throw new Error(data?.message || data?.error || 'Could not fetch profile')
      }

      const profile = data.profile

      setAuth((currentAuth) => {
        const nextAuth = { ...currentAuth, profile }
        localStorage.setItem('expense_tracker_auth', JSON.stringify(nextAuth))
        return nextAuth
      })

      return profile
    },
    [auth.session?.access_token]
  )

  const requestAuth = async (path, body) => {
    let response

    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
    } catch {
      throw new Error(`Cannot reach API server at ${API_BASE_URL}`)
    }

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      if (import.meta.env.DEV) {
        console.error('Auth request failed:', data)
      }

      throw new Error(data?.message || data?.error || 'Something went wrong')
    }

    const profile = data.session?.access_token
      ? await fetchProfile(data.session.access_token).catch(() => null)
      : null

    saveAuth({
      session: data.session,
      user: data.user,
      profile,
    })

    return data
  }

  const login = (email, password) => requestAuth('/api/auth/login', { email: email.trim(), password })

  const register = (email, password, fullName) =>
    requestAuth('/api/auth/register', {
      email: email.trim(),
      password,
      full_name: fullName.trim(),
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
    setAuth({ session: null, user: null, profile: null })
  }

  const value = useMemo(
    () => ({
      session: auth.session,
      user: auth.user,
      profile: auth.profile,
      isAuthenticated: Boolean(auth.session?.access_token),
      fetchProfile,
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
