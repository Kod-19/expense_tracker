import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!fullName.trim() || !email.trim() || password.length < 8) {
      setError('Enter your full name, a valid email, and a password with at least 8 characters.')
      return
    }

    setIsSubmitting(true)

    try {
      await register(email, password, fullName)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-6 sm:py-8">
      <form
        onSubmit={handleSubmit}
        autoComplete="on"
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-8"
      >
        <h1 className="text-2xl font-bold text-text sm:text-3xl">Create account</h1>
        <p className="mt-2 text-sm font-medium text-muted">Start with a simple profile and secure login.</p>

        {error && (
          <p className="mt-5 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm font-medium text-error">
            {error}
          </p>
        )}

        <label className="mt-6 block text-sm font-semibold text-text" htmlFor="fullName">
          Full name
        </label>
        <input
          id="fullName"
          name="name"
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          autoComplete="name"
          required
          className="mt-2 h-12 w-full rounded-lg border border-border bg-white px-3 text-text outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
        />

        <label className="mt-4 block text-sm font-semibold text-text" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="username"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="username"
          required
          className="mt-2 h-12 w-full rounded-lg border border-border bg-white px-3 text-text outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
        />

        <label className="mt-4 block text-sm font-semibold text-text" htmlFor="password">
          Password
        </label>
        <div className="relative mt-2">
          <input
            id="password"
            name="password"
            type={isPasswordVisible ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
            className="h-12 w-full rounded-lg border border-border bg-white px-3 pr-12 text-text outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
          <button
            type="button"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            aria-pressed={isPasswordVisible}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-lg text-muted transition hover:text-text focus-visible:outline-2 focus-visible:outline-primary"
          >
            {isPasswordVisible ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>
        <p className="mt-2 text-xs font-medium text-muted">Use at least 8 characters.</p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 h-12 w-full rounded-lg bg-primary px-4 text-md font-bold text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>

        <p className="mt-5 text-center text-sm font-medium text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-teal hover:text-teal/80">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  )
}

export default Register
