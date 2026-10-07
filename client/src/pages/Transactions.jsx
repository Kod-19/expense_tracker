import { useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Search, SlidersHorizontal } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'

const transactionData = [
  { id: 1, name: 'Salary', category: 'Income', type: 'income', amount: 3200, date: '2026-10-02', method: 'Bank transfer' },
  { id: 2, name: 'Grocery Store', category: 'Food', type: 'expense', amount: 156.4, date: '2026-10-04', method: 'Debit card' },
  { id: 3, name: 'Electricity Bill', category: 'Bills', type: 'expense', amount: 210.5, date: '2026-10-07', method: 'Direct debit' },
  { id: 4, name: 'Transport Pass', category: 'Transport', type: 'expense', amount: 82.75, date: '2026-10-08', method: 'Wallet' },
  { id: 5, name: 'Freelance Project', category: 'Income', type: 'income', amount: 540, date: '2026-10-09', method: 'Bank transfer' },
  { id: 6, name: 'Dinner Out', category: 'Food', type: 'expense', amount: 64.2, date: '2026-10-11', method: 'Credit card' },
  { id: 7, name: 'Streaming', category: 'Subscriptions', type: 'expense', amount: 18.99, date: '2026-10-12', method: 'Card' },
  { id: 8, name: 'Rent', category: 'Housing', type: 'expense', amount: 1200, date: '2026-10-01', method: 'Bank transfer' },
]

const filters = ['All', 'Income', 'Expense']

const formatCurrency = (value) =>
  `GHS ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const Transactions = () => {
  const [activeFilter, setActiveFilter] = useState('All')

  const filteredTransactions = useMemo(() => {
    if (activeFilter === 'All') {
      return transactionData
    }

    return transactionData.filter((transaction) => transaction.type === activeFilter.toLowerCase())
  }, [activeFilter])

  const totals = useMemo(() => {
    const income = transactionData
      .filter((transaction) => transaction.type === 'income')
      .reduce((total, transaction) => total + transaction.amount, 0)

    const expenses = transactionData
      .filter((transaction) => transaction.type === 'expense')
      .reduce((total, transaction) => total + transaction.amount, 0)

    return { income, expenses, net: income - expenses }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-2xl font-bold text-text sm:text-3xl">Transactions</p>
          <p className="mt-2 text-base font-medium text-muted">Review your cash flow and activity history.</p>
        </div>

        <Button className="h-11 rounded-xl px-5">+ Add transaction</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm font-medium text-muted">Income</p>
          <p className="mt-3 break-words text-2xl font-bold text-emerald-600 sm:text-3xl">{formatCurrency(totals.income)}</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-medium text-muted">Expenses</p>
          <p className="mt-3 break-words text-2xl font-bold text-rose-600 sm:text-3xl">{formatCurrency(totals.expenses)}</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-medium text-muted">Net</p>
          <p className={`mt-3 break-words text-2xl font-bold sm:text-3xl ${totals.net >= 0 ? 'text-primary' : 'text-error'}`}>
            {formatCurrency(totals.net)}
          </p>
        </Card>
      </div>

      <Card title="Recent activity" subtitle="Manage and review transactions by type." action={
        <div className="flex items-center gap-2 rounded-full border border-border bg-slate-50 px-3 py-1.5 text-sm font-medium text-muted">
          <Search size={16} />
          Search
        </div>
      }>
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={[
                  'rounded-full px-3 py-1.5 text-sm font-semibold transition',
                  activeFilter === filter ? 'bg-primary text-white' : 'bg-slate-100 text-muted hover:bg-slate-200',
                ].join(' ')}
              >
                {filter}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-sm font-semibold text-text transition hover:bg-slate-50"
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>
        </div>

        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={[
                    'flex h-11 w-11 items-center justify-center rounded-full',
                    transaction.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700',
                  ].join(' ')}
                >
                  {transaction.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                </div>

                <div>
                  <p className="font-semibold text-text">{transaction.name}</p>
                  <p className="text-sm font-medium text-muted">
                    {transaction.category} · {transaction.method}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="text-right">
                  <p className={`font-bold ${transaction.type === 'income' ? 'text-emerald-600' : 'text-text'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs font-medium text-muted">{new Date(transaction.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default Transactions