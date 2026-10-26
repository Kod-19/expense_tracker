import { useState } from 'react'
import {
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  PieChart,
  Settings,
  UserRound,
  X,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Brand from './Brand'

export const navLinks = [
  {
    name: 'Dashboard',
    navLink: '/dashboard',
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
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar_collapsed') === 'true'
    }
    return false
  })

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebar_collapsed', String(next))
      }
      return next
    })
  }

  const collapsed = !mobile && isCollapsed

  const handleLogout = async () => {
    await logout()
    onNavigate()
    navigate('/', { replace: true })
  }

  return (
    <aside
      className={[
        'flex shrink-0 flex-col bg-mint transition-all duration-300 ease-in-out',
        mobile
          ? 'h-full min-h-0 w-64 px-4 py-6 sm:px-5 sm:py-8'
          : collapsed
            ? 'h-screen w-20 px-2.5 py-6 sm:py-8'
            : 'h-screen w-64 px-4 py-6 sm:px-5 sm:py-8',
      ].join(' ')}
    >
      <div className={`mb-8 flex ${collapsed ? 'flex-col items-center gap-3' : 'items-center justify-between'}`}>
        <NavLink
          to="/dashboard"
          onClick={onNavigate}
          aria-label="WatchMoni home"
          title={collapsed ? 'WatchMoni Dashboard' : undefined}
          className="rounded-xl transition-opacity hover:opacity-80 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          {collapsed ? (
            <img src="/watchmoni.svg" alt="WatchMoni" className="h-9 w-9 shrink-0" />
          ) : (
            <Brand />
          )}
        </NavLink>

        {!mobile && (
          <button
            type="button"
            onClick={toggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:bg-surface/70 hover:text-text focus-visible:outline-2 focus-visible:outline-primary"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        )}

        {mobile && (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close navigation menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-text transition hover:bg-surface/70"
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
                  end={link.navLink === '/dashboard'}
                  onClick={onNavigate}
                  title={collapsed ? link.name : undefined}
                  aria-label={link.name}
                  className={({ isActive }) =>
                    [
                      'flex items-center rounded-xl transition',
                      collapsed
                        ? 'h-11 w-11 justify-center mx-auto'
                        : 'min-h-12 gap-3 px-3 text-sm font-semibold',
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-muted hover:bg-surface/70 hover:text-text',
                    ].join(' ')
                  }
                >
                  <Icon size={collapsed ? 20 : 19} className="shrink-0" />
                  {!collapsed && <span className="truncate">{link.name}</span>}
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
                  title={collapsed ? link.name : undefined}
                  aria-label={link.name}
                  className={({ isActive }) =>
                    [
                      'flex items-center rounded-xl transition',
                      collapsed
                        ? 'h-11 w-11 justify-center mx-auto'
                        : 'min-h-12 gap-3 px-3 text-sm font-semibold',
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-muted hover:bg-surface/70 hover:text-text',
                    ].join(' ')
                  }
                >
                  <Icon size={collapsed ? 20 : 19} className="shrink-0" />
                  {!collapsed && <span className="truncate">{link.name}</span>}
                </NavLink>
              </li>
            )
          })}
          <li>
            <button
              type="button"
              onClick={handleLogout}
              title={collapsed ? 'Logout' : undefined}
              aria-label="Logout"
              className={[
                'flex items-center rounded-xl text-muted transition hover:bg-surface/70 hover:text-error',
                collapsed
                  ? 'h-11 w-11 justify-center mx-auto'
                  : 'min-h-12 w-full gap-3 px-3 text-left text-sm font-semibold',
              ].join(' ')}
            >
              <LogOut size={collapsed ? 20 : 19} className="shrink-0" />
              {!collapsed && <span>Logout</span>}
            </button>
          </li>
        </ul>
      </div>
    </aside>
  )
}

export default Sidebar
