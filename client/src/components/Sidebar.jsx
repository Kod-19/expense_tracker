import {
  CreditCard,
  ArrowRightLeft,
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

  return (
    <div className="flex w-78 flex-col bg-mint px-9 py-8">
        <p className="text-xl font-bold text-text mb-10">
          Expense Tracker
        </p>

      <nav className="">
        <ul className="">
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

      <div className="">
          
      </div>
    </div>
  )
}

export default Sidebar
