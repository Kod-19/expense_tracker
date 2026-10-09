import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { getSupabaseClient } from '../lib/supabase'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '')

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
  const authRef = useRef(auth)
  const refreshPromiseRef = useRef(null)

  const saveAuth = useCallback(({ session, user, profile = null }) => {
    const nextAuth = { session, user, profile }
    authRef.current = nextAuth
    localStorage.setItem('expense_tracker_auth', JSON.stringify(nextAuth))
    setAuth(nextAuth)
  }, [])

  const clearAuth = useCallback(() => {
    const emptyAuth = { session: null, user: null, profile: null }
    authRef.current = emptyAuth
    localStorage.removeItem('expense_tracker_auth')
    setAuth(emptyAuth)
  }, [])

  const refreshAccessToken = useCallback(async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current
    }

    const refreshToken = authRef.current.session?.refresh_token
    if (!refreshToken) {
      clearAuth()
      throw new Error('Your session has expired. Please sign in again.')
    }

    refreshPromiseRef.current = (async () => {
      let response
      try {
        response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        })
      } catch {
        throw new Error(`Cannot reach API server at ${API_BASE_URL}`)
      }

      const data = await response.json().catch(() => null)
      if (!response.ok || !data?.session?.access_token) {
        clearAuth()
        throw new Error(data?.message || data?.error || 'Your session has expired. Please sign in again.')
      }

      const nextAuth = {
        ...authRef.current,
        session: data.session,
        user: data.user || authRef.current.user,
      }
      authRef.current = nextAuth
      localStorage.setItem('expense_tracker_auth', JSON.stringify(nextAuth))
      setAuth(nextAuth)
      return data.session.access_token
    })()

    try {
      return await refreshPromiseRef.current
    } finally {
      refreshPromiseRef.current = null
    }
  }, [clearAuth])

  const authorizedFetch = useCallback(
    async (path, options = {}) => {
      const makeRequest = (accessToken) =>
        fetch(`${API_BASE_URL}${path}`, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${accessToken}`,
          },
        })

      let currentToken = authRef.current.session?.access_token
      if (!currentToken) {
        throw new Error('Your session has expired. Please sign in again.')
      }

      const expiresAt = Number(authRef.current.session?.expires_at)
      if (Number.isFinite(expiresAt) && expiresAt * 1000 <= Date.now() + 30_000) {
        currentToken = await refreshAccessToken()
      }

      const response = await makeRequest(currentToken)
      if (response.status !== 401) {
        return response
      }

      const latestToken = authRef.current.session?.access_token
      const refreshedToken =
        latestToken && latestToken !== currentToken ? latestToken : await refreshAccessToken()
      const retryResponse = await makeRequest(refreshedToken)
      if (retryResponse.status === 401) {
        clearAuth()
      }
      return retryResponse
    },
    [clearAuth, refreshAccessToken]
  )

  const fetchProfile = useCallback(
    async (accessToken = auth.session?.access_token) => {
      if (!accessToken) {
        return null
      }

      const response =
        accessToken === authRef.current.session?.access_token
          ? await authorizedFetch('/api/profile/me')
          : await fetch(`${API_BASE_URL}/api/profile/me`, {
              headers: { Authorization: `Bearer ${accessToken}` },
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
        authRef.current = nextAuth
        localStorage.setItem('expense_tracker_auth', JSON.stringify(nextAuth))
        return nextAuth
      })

      return profile
    },
    [auth.session?.access_token, authorizedFetch]
  )

  const updateProfile = useCallback(
    async (fullName) => {
      const accessToken = auth.session?.access_token

      if (!accessToken) {
        throw new Error('Your session has expired. Please sign in again.')
      }

      const response = await authorizedFetch('/api/profile/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Could not update profile')
      }

      setAuth((currentAuth) => {
        const nextAuth = { ...currentAuth, profile: data.profile }
        authRef.current = nextAuth
        localStorage.setItem('expense_tracker_auth', JSON.stringify(nextAuth))
        return nextAuth
      })

      return data.profile
    },
    [auth.session?.access_token, authorizedFetch]
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

  const loginWithGoogle = useCallback(async () => {
    const { data, error } = await getSupabaseClient().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: true,
      },
    })

    if (error) {
      throw error
    }

    if (!data.url) {
      throw new Error('Supabase did not provide a Google sign-in URL.')
    }

    window.location.assign(data.url)
  }, [])

  const completeOAuthLogin = useCallback(async (session, user) => {
    if (!session?.access_token || !user) {
      throw new Error('Google sign-in did not return a valid user session.')
    }

    saveAuth({ session, user })

    const possibleNames = [
      user.user_metadata?.full_name,
      user.user_metadata?.name,
      user.email?.split('@')[0],
    ]
    const fullName = (possibleNames.find((name) => typeof name === 'string' && name.trim()) || 'User')
      .trim()
      .slice(0, 100)

    let response
    try {
      response = await fetch(`${API_BASE_URL}/api/profile/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ full_name: fullName }),
      })
    } catch {
      throw new Error(`Signed in with Google, but cannot reach API server at ${API_BASE_URL} to load your profile.`)
    }

    const data = await response.json().catch(() => null)
    if (!response.ok || !data?.profile) {
      throw new Error(data?.message || data?.error || 'Signed in with Google, but could not create your profile.')
    }

    setAuth((currentAuth) => {
      const nextAuth = { ...currentAuth, profile: data.profile }
      authRef.current = nextAuth
      localStorage.setItem('expense_tracker_auth', JSON.stringify(nextAuth))
      return nextAuth
    })
  }, [saveAuth])

  const logout = useCallback(async () => {
    const accessToken = authRef.current.session?.access_token

    if (accessToken) {
      await authorizedFetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).catch(() => {})
    }

    clearAuth()
  }, [authorizedFetch, clearAuth])

  const value = useMemo(
    () => ({
      session: auth.session,
      user: auth.user,
      profile: auth.profile,
      isAuthenticated: Boolean(auth.session?.access_token),
      authorizedFetch,
      fetchProfile,
      updateProfile,
      login,
      loginWithGoogle,
      completeOAuthLogin,
      register,
      logout,
    }),
    [auth, authorizedFetch, completeOAuthLogin, loginWithGoogle]
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
