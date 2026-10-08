import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Doughnut, Line } from 'react-chartjs-2'
import { Link } from 'react-router-dom'
import { ArrowDownLeft, ArrowUpRight, LoaderCircle } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/preferences'

const CHART_COLORS = ['#2663EB', '#14A6A1', '#F97316', '#8B5CF6', '#EC4899', '#EAB308', '#64748B']

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend
)

const formatCurrency = (value) =>
  `GHS ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const dateValue = (value) => String(value).slice(0, 10)

const createRecentMonthKeys = () => {
  const now = new Date()
  return Array.from({ length: 6 }, (_, index) => {
    const month = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1)
    return {
      key: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`,
      label: month.toLocaleDateString(undefined, { month: 'short' }),
    }
  })
}

const Dashboard = () => {
  const { authorizedFetch, fetchProfile, profile, user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!profile) {
      fetchProfile().catch(() => {})
    }
  }, [fetchProfile, profile])

  const loadTransactions = useCallback(
    async (signal) => {
      setIsLoading(true)
      setLoadError('')
      try {
        const response = await authorizedFetch('/api/transactions', { signal })
        const data = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(data?.message || data?.error || 'Could not load dashboard data.')
        }
        if (!Array.isArray(data?.transactions)) {
          throw new Error('The API returned an invalid transactions response.')
        }
        setTransactions(data.transactions)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setLoadError(error.message || 'Could not load dashboard data.')
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false)
        }
      }
    },
    [authorizedFetch]
  )

  useEffect(() => {
    const controller = new AbortController()
    loadTransactions(controller.signal)
    return () => controller.abort()
  }, [loadTransactions])

  const fullName = profile?.full_name || user?.full_name || user?.user_metadata?.full_name || user?.email || 'User'
  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => dateValue(b.date).localeCompare(dateValue(a.date))),
    [transactions]
  )
  const totals = useMemo(
    () =>
      transactions.reduce(
        (result, transaction) => {
          const amount = Number(transaction.amount) || 0
          if (transaction.type === 'income') {
            result.income += amount
          } else if (transaction.type === 'expense') {
            result.expenses += amount
          }
          return result
        },
        { income: 0, expenses: 0 }
      ),
    [transactions]
  )
  const balance = totals.income - totals.expenses

  const monthlyKeys = useMemo(createRecentMonthKeys, [])
  const monthlyTotals = useMemo(() => {
    const byMonth = new Map(monthlyKeys.map(({ key }) => [key, { income: 0, expenses: 0 }]))
    transactions.forEach((transaction) => {
      const month = dateValue(transaction.date).slice(0, 7)
      const monthTotal = byMonth.get(month)
      if (!monthTotal) {
        return
      }
      const amount = Number(transaction.amount) || 0
      if (transaction.type === 'income') {
        monthTotal.income += amount
      } else if (transaction.type === 'expense') {
        monthTotal.expenses += amount
      }
    })
    return monthlyKeys.map(({ key }) => byMonth.get(key))
  }, [monthlyKeys, transactions])

  const spendingByCategory = useMemo(() => {
    const totalsByCategory = new Map()
    transactions
      .filter((transaction) => transaction.type === 'expense')
      .forEach((transaction) => {
        const category = transaction.category?.trim() || 'Uncategorized'
        totalsByCategory.set(
          category,
          (totalsByCategory.get(category) || 0) + (Number(transaction.amount) || 0)
        )
      })
    return [...totalsByCategory.entries()].sort((a, b) => b[1] - a[1])
  }, [transactions])

  const categoryChartData = {
    labels: spendingByCategory.map(([category]) => category),
    datasets: [
      {
        data: spendingByCategory.map(([, amount]) => amount),
        backgroundColor: spendingByCategory.map((_, index) => CHART_COLORS[index % CHART_COLORS.length]),
        borderWidth: 0,
      },
    ],
  }

  const monthlyChartData = {
    labels: monthlyKeys.map(({ label }) => label),
    datasets: [
      {
        label: 'Income',
        data: monthlyTotals.map(({ income }) => income),
        borderColor: '#10B981',
        backgroundColor: '#10B981',
        tension: 0.35,
      },
      {
        label: 'Expenses',
        data: monthlyTotals.map(({ expenses }) => expenses),
        borderColor: '#F43F5E',
        backgroundColor: '#F43F5E',
        tension: 0.35,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label ? `${context.dataset.label}: ` : ''}${formatCurrency(context.raw)}`,
        },
      },
    },
  }

  const formatPercentage = (value, total) => `${((value / total) * 100).toFixed(1)}%`
  const summary = [
    {
      label: 'Income',
      value: totals.income,
      tone: totals.income >= totals.expenses ? 'text-emerald-600' : 'text-rose-600',
      percentageTone: totals.expenses > 0
        ? totals.income >= totals.expenses ? 'text-emerald-600' : 'text-rose-600'
        : 'text-muted',
      description: totals.expenses > 0
        ? { before: 'Your income was ', percentage: formatPercentage(totals.income, totals.expenses), after: ' of your expenses' }
        : { text: 'Add an expense to see how your income compares' },
    },
    {
      label: 'Expenses',
      value: totals.expenses,
      tone: 'text-rose-600',
      percentageTone: 'text-rose-600',
      description: totals.income > 0
        ? { before: 'You spent ', percentage: formatPercentage(totals.expenses, totals.income), after: ' of your income' }
        : { text: 'Add income to see how your spending compares' },
    },
    {
      label: 'Balance',
      value: balance,
      tone: balance >= 0 ? 'text-emerald-600' : 'text-rose-600',
      percentageTone: totals.expenses > 0
        ? balance >= 0 ? 'text-emerald-600' : 'text-rose-600'
        : 'text-muted',
      description: totals.expenses > 0
        ? {
            before: balance > 0
              ? 'Your income was '
              : balance < 0
                ? 'Your expenses were higher by '
                : 'You broke even with ',
            percentage: formatPercentage(Math.abs(balance), totals.expenses),
            after: balance > 0
              ? ' compared with your expenses'
              : balance < 0
                ? ' of your expenses'
                : ' difference',
          }
        : { text: 'Add expenses to see how your balance compares' },
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text sm:text-3xl">Welcome, {fullName.split(' ')[0]}.</h1>
        <p className="pt-2 text-base font-medium text-muted">Here’s a summary of your money.</p>
      </div>

      {loadError && (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-error/30 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-error">Your dashboard couldn’t be loaded</p>
            <p className="mt-1 text-sm text-muted">{loadError}</p>
          </div>
          <Button variant="muted" onClick={() => loadTransactions()}>
            Try again
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-muted" role="status">
          <LoaderCircle size={30} className="animate-spin text-primary" />
          <span className="text-sm font-medium">Loading your dashboard...</span>
        </div>
      ) : !loadError && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {summary.map((item) => (
              <Card key={item.label} className="p-5">
                <p className="text-sm font-medium text-muted">{item.label}</p>
                <p className={`mt-3 break-words text-2xl font-bold sm:text-3xl ${item.tone}`}>
                  {formatCurrency(item.value)}
                </p>
                <p className="mt-2 text-sm font-medium text-muted">
                  {item.description.text || (
                    <>
                      {item.description.before}
                      <span className={`font-bold ${item.percentageTone}`}>{item.description.percentage}</span>
                      {item.description.after}
                    </>
                  )}
                </p>
              </Card>
            ))}
          </div>

          {transactions.length === 0 ? (
            <Card className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ArrowUpRight size={22} />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-text">Start tracking your money</h2>
              <p className="mt-1 max-w-md text-sm text-muted">
                Add your income and expenses to see your spending summary and charts.
              </p>
              <Link
                to="/transactions"
                className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90"
              >
                Add your first transaction
              </Link>
            </Card>
          ) : (
            <>
              <div className="grid gap-6 xl:grid-cols-2">
                <Card title="Where your money goes" subtitle="See how much you spent in each category.">
                  {spendingByCategory.length === 0 ? (
                    <div className="flex min-h-64 items-center justify-center text-center text-sm font-medium text-muted">
                      No expenses yet.
                    </div>
                  ) : (
                    <div className="mx-auto h-72 max-w-xl">
                      <Doughnut
                        data={categoryChartData}
                        options={{
                          ...chartOptions,
                          cutout: '62%',
                          plugins: {
                            ...chartOptions.plugins,
                            tooltip: {
                              callbacks: {
                                label: (context) => `${context.label}: ${formatCurrency(context.raw)}`,
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  )}
                </Card>

                <Card title="Monthly income and expenses" subtitle="Compare the money you received and spent over the last six months.">
                  <div className="h-72 min-w-0">
                    <Line
                      data={monthlyChartData}
                      options={{
                        ...chartOptions,
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: { callback: (value) => formatCurrency(value) },
                          },
                          x: { grid: { display: false } },
                        },
                      }}
                    />
                  </div>
                </Card>
              </div>

              <Card
                title="Recent transactions"
                subtitle="Your latest income and expenses."
                action={
                  <Link to="/transactions" className="text-sm font-semibold text-primary hover:text-primary/80">
                    View all
                  </Link>
                }
              >
                <div className="space-y-3">
                  {sortedTransactions.slice(0, 5).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border bg-slate-50 px-3 py-3 sm:px-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className={[
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                          transaction.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700',
                        ].join(' ')}>
                          {transaction.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-text">{transaction.name}</p>
                          <p className="text-sm text-muted">
                            {transaction.category} · {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>
                      <p className={`shrink-0 text-right text-sm font-bold sm:text-base ${transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default Dashboard
