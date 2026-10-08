import {
  ArrowRightLeft,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  X,
  PieChart,
  UserRound,
  Settings,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Brand from './Brand'

export const navLinks = [
  {
    name: 'Dashboard',
    navLink: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Transactions',
    navLink: '/transactions',
    icon: ArrowRightLeft,
  },
  {
    name: 'Categories',
    navLink: '/categories',
    icon: FolderOpen,
  },
  {
    name: 'Budgets',
    navLink: '/budgets',
    icon: PieChart,
  },
]

const bottomLinks = [
  {
    name: 'Profile',
    navLink: '/profile',
    icon: UserRound,
  },
  {
    name: 'Settings',
    navLink: '/settings',
    icon: Settings,
  },
]

const Sidebar = ({ mobile = false, onNavigate = () => {} }) => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    onNavigate()
    navigate('/login', { replace: true })
  }

  return (
    <aside
      className={[
        'flex w-64 shrink-0 flex-col bg-mint px-4 py-6 sm:px-5 sm:py-8',
        mobile ? 'h-full min-h-0' : 'h-screen',
      ].join(' ')}
    >
      <div className="mb-8 flex items-center justify-between">
        <NavLink
          to="/"
          onClick={onNavigate}
          aria-label="WatchMoni home"
          className="rounded-xl transition-opacity hover:opacity-80 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <Brand />
        </NavLink>
        
        {mobile && (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close navigation menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-text transition hover:bg-white/60"
          >
            <X size={21} />
          </button>
        )}
      </div>

      <nav className="flex-1">
        <ul className="space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon

            return (
              <li key={link.name}>
                <NavLink
                  to={link.navLink}
                  end={link.navLink === '/'}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    [
                      'flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition',
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-muted hover:bg-white/60 hover:text-text',
                    ].join(' ')
                  }
                >
                  <Icon size={19} />
                  {link.name}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="mt-6 border-t border-muted/20 pt-5">
        <ul className="space-y-1">
          {bottomLinks.map((link) => {
            const Icon = link.icon

            return (
              <li key={link.name}>
                <NavLink
                  to={link.navLink}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    [
                      'flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition',
                      isActive ? 'bg-primary text-white shadow-sm' : 'text-muted hover:bg-white/60 hover:text-text',
                    ].join(' ')
                  }
                >
                  <Icon size={19} />
                  {link.name}
                </NavLink>
              </li>
            )
          })}
          <li>
            <button
              type="button"
              onClick={handleLogout}
              className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-muted transition hover:bg-white/60 hover:text-error"
            >
              <LogOut size={19} />
              Logout
            </button>
          </li>
        </ul>
      </div>
    </aside>
  )
}

export default Sidebar
