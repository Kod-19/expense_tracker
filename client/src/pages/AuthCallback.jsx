import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Brand from '../components/Brand'
import { useAuth } from '../context/AuthContext'
import { getSupabaseClient } from '../lib/supabase'

const processedCodes = new Set()

const formatOAuthError = (rawMessage) => {
  if (!rawMessage) return 'Could not finish Google sign-in. Please try again.'
  if (rawMessage.includes('PKCE code verifier not found in storage')) {
    return 'The sign-in code verifier was not found. This can happen if the sign-in session expired, the browser window was refreshed, or sign-in was started in a different browser. Please try signing in again.'
  }
  return rawMessage
}

const AuthCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { completeOAuthLogin } = useAuth()
  const [error, setError] = useState('')
  const startedRef = useRef(false)

  useEffect(() => {
    const code = searchParams.get('code')
    if (code && processedCodes.has(code)) {
      return
    }

    if (startedRef.current) {
      return
    }
    startedRef.current = true

    if (code) {
      processedCodes.add(code)
    }

    const completeSignIn = async () => {
      const hashParams = new URLSearchParams(window.location.hash.slice(1))
      const providerError =
        searchParams.get('error_description') ||
        searchParams.get('error') ||
        hashParams.get('error_description') ||
        hashParams.get('error')
      if (providerError) {
        throw new Error(providerError)
      }

      const supabase = getSupabaseClient()
      let session
      let user

      if (code) {
        // Exchange fresh authorization code for session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          throw exchangeError
        }
        session = data.session
        user = data.user
      } else {
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (accessToken && refreshToken) {
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (sessionError) {
            throw sessionError
          }
          session = data.session
          user = data.user
        } else {
          // If neither code nor hash tokens exist, check if an active unexpired session exists
          const { data: existingData } = await supabase.auth.getSession().catch(() => ({ data: {} }))
          const existing = existingData?.session
          if (existing?.access_token && existing?.user) {
            const expiresAt = Number(existing.expires_at)
            if (!Number.isFinite(expiresAt) || expiresAt * 1000 > Date.now()) {
              session = existing
              user = existing.user
            }
          }
        }
      }

      if (!session || !user) {
        throw new Error('Google sign-in completed without an active session. Please try again.')
      }

      // Strip query parameters (?code=...) and hash so reload doesn't re-trigger
      window.history.replaceState(null, '', window.location.pathname)

      // Verify with backend profile endpoint and save session
      await completeOAuthLogin(session, user)
      navigate('/dashboard', { replace: true })
    }

    completeSignIn().catch((callbackError) => {
      window.history.replaceState(null, '', window.location.pathname)
      setError(formatOAuthError(callbackError.message))
    })
  }, [completeOAuthLogin, navigate, searchParams])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-6 sm:py-8">
      <div className="w-full max-w-md">
        <Link
          to="/login"
          aria-label="WatchMoni sign in"
          className="mb-6 flex justify-center rounded-xl transition-opacity hover:opacity-80"
        >
          <Brand greeting />
        </Link>
        <section className="w-full rounded-2xl border border-border bg-surface p-5 text-center shadow-sm sm:p-8">
          {error ? (
            <>
              <h1 className="text-2xl font-bold text-text">Could not finish sign-in</h1>
              <p role="alert" className="mt-4 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm font-medium text-error">
                {error}
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary/90"
              >
                Back to sign in
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-text">Signing you in</h1>
              <p className="mt-2 text-sm font-medium text-muted">Please wait while we finish Google sign-in.</p>
            </>
          )}
        </section>
      </div>
    </main>
  )
}

export default AuthCallback
