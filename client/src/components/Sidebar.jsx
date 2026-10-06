import {
  CreditCard,
  FolderOpen,
  LayoutDashboard,
  PieChart,
  Settings,
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
      icon: CreditCard,
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
    {
      name: 'Settings',
      navLink: '/settings',
      icon: Settings,
    },
  ]

  return (
    <div className="flex w-72 flex-col bg-mint px-6 py-8">
      <div className="mb-16">
        <p className="text-xl font-bold text-text">Expense Tracker</p>
      </div>

      <nav>
        <ul className="space-y-3">
          {navLinks.map((link) => {
            const Icon = link.icon

            return (
              <li key={link.name}>
                <NavLink
                  to={link.navLink}
                  end={link.navLink === '/'}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition',
                      isActive
                        ? 'bg-primary text-surface shadow-sm'
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
    </div>
  )
}

export default Sidebar
