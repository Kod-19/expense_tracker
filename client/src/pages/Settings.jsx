import { useState } from 'react'
import { Check, SlidersHorizontal } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import { useToast } from '../components/ToastProvider'
import { DEFAULT_PREFERENCES, getPreferences, savePreferences } from '../utils/preferences'

const Settings = () => {
  const notify = useToast()
  const [preferences, setPreferences] = useState(getPreferences)

  const handleChange = (event) => {
    const { name, value } = event.target
    setPreferences((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    try {
      savePreferences(preferences)
      notify('Settings saved.')
    } catch {
      notify('Settings could not be saved on this device.', 'error')
    }
  }

  const resetPreferences = () => {
    try {
      savePreferences(DEFAULT_PREFERENCES)
      setPreferences(DEFAULT_PREFERENCES)
      notify('Settings restored to defaults.')
    } catch {
      notify('Settings could not be saved on this device.', 'error')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text">Settings</h1>
        <p className="mt-2 text-base font-medium text-muted">Adjust how Expense Tracker works for you.</p>
      </div>

      <Card className="p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <SlidersHorizontal size={19} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text">Your preferences</h2>
            <p className="mt-1 text-sm text-muted">These choices are saved on this device and used in your transaction list and form.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="date-format" className="mb-2 block text-sm font-semibold text-text">
              Date format
            </label>
            <select
              id="date-format"
              name="dateFormat"
              value={preferences.dateFormat}
              onChange={handleChange}
              className="h-12 w-full rounded-lg border border-border bg-white px-3 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 sm:max-w-sm"
            >
              <option value="DD/MM/YYYY">Day / month / year (DD/MM/YYYY)</option>
              <option value="MM/DD/YYYY">Month / day / year (MM/DD/YYYY)</option>
              <option value="YYYY-MM-DD">Year / month / day (YYYY-MM-DD)</option>
            </select>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-text">Default transaction type</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { value: 'expense', label: 'Expense', detail: 'Start new transactions as an expense.' },
                { value: 'income', label: 'Income', detail: 'Start new transactions as income.' },
              ].map(({ value, label, detail }) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                    preferences.defaultTransactionType === value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="defaultTransactionType"
                    value={value}
                    checked={preferences.defaultTransactionType === value}
                    onChange={handleChange}
                    className="mt-1 accent-primary"
                  />
                  <span>
                    <span className="block font-bold text-text">{label}</span>
                    <span className="mt-1 block text-sm text-muted">{detail}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-3 border-t border-border pt-5">
            <Button type="submit" className="gap-2">
              <Check size={17} />
              Save settings
            </Button>
            <Button variant="secondary" onClick={resetPreferences}>
              Restore defaults
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default Settings
