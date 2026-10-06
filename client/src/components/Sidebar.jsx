import {
  ArrowRightLeft,
  FolderOpen,
  LayoutDashboard,
  PieChart,
  Settings,
  UserRound,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
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

  return (
    <div className="flex w-78 flex-col bg-mint px-9 py-8">
      <a href='/' className="mb-10 text-xl font-bold text-text">
        Expense Tracker
      </a>

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
        </ul>
      </div>
    </div>
  )
}

export default Sidebar
