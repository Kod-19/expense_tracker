import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-sm"
      >
        <h1 className="text-3xl font-bold text-text">Welcome back</h1>
        <p className="mt-2 text-sm font-medium text-muted">Sign in to continue tracking your money.</p>

        {error && (
          <p className="mt-5 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm font-medium text-error">
            {error}
          </p>
        )}

        <label className="mt-6 block text-sm font-semibold text-text" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="mt-2 h-12 w-full rounded-lg border border-border bg-white px-3 text-text outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
        />

        <label className="mt-4 block text-sm font-semibold text-text" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="mt-2 h-12 w-full rounded-lg border border-border bg-white px-3 text-text outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 h-12 w-full rounded-lg bg-teal px-4 text-sm font-bold text-white transition hover:bg-teal/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="mt-5 text-center text-sm font-medium text-muted">
          Need an account?{' '}
          <Link to="/register" className="font-bold text-teal hover:text-teal/80">
            Create one
          </Link>
        </p>
      </form>
    </main>
  )
}

export default Login
