import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const ThemeToggle = () => {
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const Icon = isDark ? Sun : Moon

  return (
    <button
      type="button"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      aria-pressed={isDark}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      onClick={toggleTheme}
      className="fixed right-16 top-3 z-[60] flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-text shadow-md transition hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:right-4 lg:top-4"
    >
      <Icon size={20} aria-hidden="true" />
    </button>
  )
}

export default ThemeToggle
