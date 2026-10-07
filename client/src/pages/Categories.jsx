import { FolderTree, PiggyBank, ShoppingBag, TrendingUp, Wallet } from 'lucide-react'
import Card from '../components/Card'

const categories = [
  { name: 'Food & Dining', spent: 482.65, budget: 600, icon: ShoppingBag, color: 'bg-rose-100 text-rose-700' },
  { name: 'Housing', spent: 1200, budget: 1300, icon: Wallet, color: 'bg-sky-100 text-sky-700' },
  { name: 'Savings', spent: 850, budget: 900, icon: PiggyBank, color: 'bg-emerald-100 text-emerald-700' },
  { name: 'Investments', spent: 320, budget: 500, icon: TrendingUp, color: 'bg-violet-100 text-violet-700' },
]

const Categories = () => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-3xl font-bold text-text">Categories</p>
        <p className="mt-2 text-base font-medium text-muted">Track how your spending is distributed.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {categories.map(({ name, spent, budget, icon: Icon, color }) => {
          const progress = Math.min((spent / budget) * 100, 100)

          return (
            <Card key={name} className="p-4">
              <div className="flex items-center justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
                  <Icon size={18} />
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-muted">
                  {Math.round(progress)}%
                </span>
              </div>

              <p className="mt-4 text-lg font-semibold text-text">{name}</p>
              <p className="mt-2 text-2xl font-bold text-text">GHS {spent.toFixed(2)}</p>
              <p className="mt-1 text-sm font-medium text-muted">of GHS {budget.toFixed(2)} budget</p>

              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
              </div>
            </Card>
          )
        })}
      </div>

      <Card title="Category insights" subtitle="Your spending segments for the month." className="p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FolderTree size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted">Top category</p>
                <p className="text-lg font-bold text-text">Housing</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10 text-teal">
                <TrendingUp size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted">Monthly trend</p>
                <p className="text-lg font-bold text-text">+8.2%</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Categories