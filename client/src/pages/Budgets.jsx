import { ArrowUpRight, CircleDollarSign, Target } from 'lucide-react'
import Card from '../components/Card'

const budgets = [
  { name: 'Food', current: 420, limit: 600, accent: 'bg-rose-100 text-rose-700' },
  { name: 'Transport', current: 180, limit: 250, accent: 'bg-sky-100 text-sky-700' },
  { name: 'Bills', current: 260, limit: 350, accent: 'bg-violet-100 text-violet-700' },
  { name: 'Fun', current: 140, limit: 300, accent: 'bg-amber-100 text-amber-700' },
]

const Budgets = () => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-3xl font-bold text-text">Budgets</p>
        <p className="mt-2 text-base font-medium text-muted">Stay on top of spending limits across categories.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {budgets.map(({ name, current, limit, accent }) => {
          const percentage = Math.min((current / limit) * 100, 100)
          const remainder = Math.max(limit - current, 0)

          return (
            <Card key={name} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
                    <Target size={18} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-text">{name}</p>
                    <p className="text-sm font-medium text-muted">{Math.round(percentage)}% used</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-primary">GHS {remainder.toFixed(2)} left</span>
              </div>

              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }} />
              </div>

              <div className="mt-4 flex items-center justify-between text-sm font-medium text-muted">
                <span>Spent: GHS {current.toFixed(2)}</span>
                <span>Limit: GHS {limit.toFixed(2)}</span>
              </div>
            </Card>
          )
        })}
      </div>

      <Card title="Budget summary" subtitle="Performance vs target for this cycle." className="p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-primary/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CircleDollarSign size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted">Total budget</p>
                <p className="text-xl font-bold text-text">GHS 1,500</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <ArrowUpRight size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted">Saved</p>
                <p className="text-xl font-bold text-text">GHS 320</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-text">
                <Target size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted">Goal status</p>
                <p className="text-xl font-bold text-text">On track</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Budgets