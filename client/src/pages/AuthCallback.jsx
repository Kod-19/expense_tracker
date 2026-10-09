import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Brand from '../components/Brand'
import { useAuth } from '../context/AuthContext'
import { getSupabaseClient } from '../lib/supabase'

const AuthCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { completeOAuthLogin, isAuthenticated } = useAuth()
  const [error, setError] = useState('')
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) {
      return
    }

    startedRef.current = true

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

      const code = searchParams.get('code')
      const supabase = getSupabaseClient()
      let session
      let user

      if (code) {
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          throw exchangeError
        }
        session = data.session
        user = data.user
      } else {
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (!accessToken || !refreshToken) {
          throw new Error(
            'Supabase returned neither an authorization code nor session tokens. Check the Supabase callback URL and redirect URL configuration, then try again.'
          )
        }

        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (sessionError) {
          throw sessionError
        }
        session = data.session
        user = data.user
      }

      if (!session || !user) {
        throw new Error('Google sign-in completed without an active session. Please try again.')
      }

      window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}`)
      await completeOAuthLogin(session, user)
      navigate('/dashboard', { replace: true })
    }

    completeSignIn().catch((callbackError) => {
      setError(callbackError.message || 'Could not finish Google sign-in. Please try again.')
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
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => navigate('/dashboard', { replace: true })}
                  className="mt-6 h-12 w-full rounded-lg bg-primary px-4 text-sm font-bold text-white"
                >
                  Continue to WatchMoni
                </button>
              ) : (
                <Link to="/login" className="mt-6 inline-block font-bold text-primary">
                  Back to sign in
                </Link>
              )}
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
