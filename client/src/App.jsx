import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import MobileNavigation from './components/MobileNavigation'
import Sidebar from './components/Sidebar'
import { useAuth } from './context/AuthContext'
import Budgets from './pages/Budgets'
import Categories from './pages/Categories'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Register from './pages/Register'
import Settings from './pages/Settings'
import Transactions from './pages/Transactions'

const AppLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined
    }

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isMenuOpen])

  return (
    <div className="min-h-screen bg-background lg:flex lg:h-screen lg:overflow-hidden">
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur sm:px-6 lg:hidden">
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation-drawer"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-text transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Menu size={22} />
        </button>
        <span className="text-base font-bold text-text">Expense Tracker</span>
      </header>

      <main className="min-w-0 px-4 py-5 pb-24 sm:px-6 sm:py-6 sm:pb-24 lg:flex-1 lg:overflow-y-auto lg:p-8">
        <Outlet />
      </main>

      <MobileNavigation isMenuOpen={isMenuOpen} onMenuClick={() => setIsMenuOpen(true)} />

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="presentation">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setIsMenuOpen(false)}
            className="absolute inset-0 bg-slate-950/40"
          />
          <div
            id="mobile-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            className="relative z-10 h-full w-[min(18rem,85vw)] shadow-2xl"
          >
            <Sidebar mobile onNavigate={() => setIsMenuOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

const PublicRoute = () => {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

const App = () => (
  <Routes>
    <Route element={<PublicRoute />}>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)

export default App
