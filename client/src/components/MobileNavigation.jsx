import { MoreHorizontal } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { navLinks } from './Sidebar'

const MobileNavigation = ({ isMenuOpen, onMenuClick }) => {
  const location = useLocation()
  const isMoreActive = ['/profile', '/settings'].includes(location.pathname)

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(15,23,42,0.06)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto flex h-16 max-w-xl items-stretch justify-around">
        {navLinks.map(({ name, navLink, icon: Icon }) => (
          <li key={name} className="flex min-w-0 flex-1">
            <NavLink
              to={navLink}
              end={navLink === '/'}
              className={({ isActive }) =>
                [
                  'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold transition sm:text-xs',
                  isActive ? 'text-primary' : 'text-muted hover:text-text',
                ].join(' ')
              }
            >
              <Icon size={19} aria-hidden="true" />
              <span className="max-w-full truncate">{name}</span>
            </NavLink>
          </li>
        ))}
        <li className="flex min-w-0 flex-1">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open more navigation options"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation-drawer"
            className={[
              'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold transition sm:text-xs',
              isMoreActive ? 'text-primary' : 'text-muted hover:text-text',
            ].join(' ')}
          >
            <MoreHorizontal size={20} aria-hidden="true" />
            <span>More</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default MobileNavigation
