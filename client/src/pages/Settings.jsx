import { Bell, Lock, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'

const settingsSections = [
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Control alerts for transactions, budgets, and weekly summaries.',
    action: 'Manage',
  },
  {
    icon: Lock,
    title: 'Security',
    description: 'Update your password and manage sign-in preferences.',
    action: 'Update',
  },
  {
    icon: SlidersHorizontal,
    title: 'Preferences',
    description: 'Set your default currency, date format, and dashboard layout.',
    action: 'Edit',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy',
    description: 'Review account visibility settings and data protection controls.',
    action: 'Review',
  },
]

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-3xl font-bold text-text">Settings</p>
        <p className="mt-2 text-base font-medium text-muted">Customize your spending experience.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {settingsSections.map(({ icon: Icon, title, description, action }) => (
          <Card key={title} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-text">{title}</p>
                  <p className="mt-1 text-sm text-muted">{description}</p>
                </div>
              </div>
              <Button variant="secondary" className="shrink-0 px-3 py-2 text-sm">
                {action}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Settings