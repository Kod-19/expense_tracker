import {
  ArrowRightLeft,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  PieChart,
  Settings,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Sidebar = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const navLinks = [
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
      name: 'Settings',
      navLink: '/settings',
      icon: Settings,
    },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-screen w-69 shrink-0 flex-col bg-mint px-4 py-8">
      <NavLink to="/" className="mb-10 text-xl font-bold text-text">
        Expense Tracker
      </NavLink>

      <nav className="flex-1">
        <ul>
          {navLinks.map((link) => {
            const Icon = link.icon

            return (
              <li key={link.name}>
                <NavLink
                  to={link.navLink}
                  end={link.navLink === '/'}
                  className={({ isActive }) =>
                    [
                      'flex h-12 items-center gap-3 rounded-lg px-2 text-sm font-medium transition',
                      isActive
                        ? 'bg-teal text-surface shadow-sm'
                        : 'text-muted hover:bg-mint hover:text-text',
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

      <div className="mt-10 border-t border-muted/20 pt-5">
        <ul className="space-y-3">
          {bottomLinks.map((link) => {
            const Icon = link.icon

            return (
              <li key={link.name}>
                <NavLink
                  to={link.navLink}
                  className={({ isActive }) =>
                    [
                      'flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition',
                      isActive
                        ? 'bg-teal text-surface shadow-sm'
                        : 'bg-surface/70 text-text hover:bg-surface hover:text-muted',
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
              className="flex h-12 w-full items-center gap-3 rounded-xl bg-surface/70 px-3 text-left text-sm font-semibold text-text transition hover:bg-surface hover:text-error"
            >
              <LogOut size={19} />
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Sidebar
