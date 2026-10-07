import { useEffect } from 'react'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend)

const Dashboard = () => {
  const { fetchProfile, profile, user } = useAuth()

  useEffect(() => {
    if (!profile) {
      fetchProfile().catch(() => {})
    }
  }, [fetchProfile, profile])

  const fullName = profile?.full_name || user?.full_name || user?.user_metadata?.full_name || user?.email || 'User'
  const userInitial = fullName.trim().charAt(0).toUpperCase()

  const summary = [
    { label: 'Balance', value: 2134.56, tone: 'text-emerald-600', percentageChange: '+12.5%' },
    { label: 'Income', value: 4200.0, tone: 'text-sky-600', percentageChange: '+8.2%' },
    { label: 'Expenses', value: 1270.44, tone: 'text-rose-600', percentageChange: '-5.7%' },
  ]

  const recentTransactions = [
    { id: 1, name: 'Salary', amount: 3200.0, date: '12 Jan', month: 'Jan', category: 'Income', type: 'income' },
    { id: 2, name: 'Groceries', amount: 153.0, date: '28 May', month: 'May', category: 'Food', type: 'expense' },
    { id: 3, name: 'Utilities', amount: 305.6, date: '06 Aug', month: 'Aug', category: 'Bills', type: 'expense' },
    { id: 4, name: 'Transport pass', amount: 82.75, date: '14 Aug', month: 'Aug', category: 'Transport', type: 'expense' },
    { id: 5, name: 'Dinner out', amount: 64.2, date: '20 Sep', month: 'Sep', category: 'Food', type: 'expense' },
    { id: 6, name: 'Software subscription', amount: 24.99, date: '02 Oct', month: 'Oct', category: 'Subscriptions', type: 'expense' },
  ]

  const spendingMonths = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
  const spendingByMonth = spendingMonths.map((month) =>
    recentTransactions
      .filter((transaction) => transaction.type === 'expense' && transaction.month === month)
      .reduce((total, transaction) => total + transaction.amount, 0)
  )

  const expenseTransactions = recentTransactions.filter((transaction) => transaction.type === 'expense')
  const highestExpense = expenseTransactions.reduce(
    (highest, transaction) => (transaction.amount > highest.amount ? transaction : highest),
    expenseTransactions[0]
  )
  const totalTrackedSpending = expenseTransactions.reduce(
    (total, transaction) => total + transaction.amount,
    0
  )

  const spendingOverviewData = {
    labels: spendingMonths,
    datasets: [
      {
        label: 'Monthly spending',
        data: spendingByMonth,
        backgroundColor: '#14A6A1',
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 52,
      },
    ],
  }

  const spendingOverviewOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `$${Number(context.raw).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748B',
          font: {
            family: 'Lato',
            weight: 700,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#E2E8F0',
        },
        ticks: {
          color: '#64748B',
          callback: (value) => `$${value}`,
        },
      },
    },
  }

  return (
    <>
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-3xl font-bold">Welcome, {fullName.split(' ')[0]}.</p>
          <p className="pt-3 text-lg font-medium text-muted">Here is your financial overview.</p>
        </div>

        <Link
          to="/profile"
          aria-label="Open profile"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal text-sm font-bold text-white shadow-sm transition hover:bg-teal/90"
        >
          {userInitial}
        </Link>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
          {summary.map((item) => (
            <div
              key={item.label}
              className="flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">{item.label}</p>
              <p className={`mt-3 text-3xl font-bold ${item.tone}`}>
                GHS {item.value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="mt-4 text-sm font-medium text-slate-500"><span className={item.percentageChange.startsWith('-') ? 'text-rose-600 font-bold text-lg' : 'text-emerald-600 font-bold text-lg'}>{item.percentageChange}</span> since last month</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Spending overview</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Monthly expense habits based on tracked transactions.
              </p>
            </div>
            <Link
              to="/transactions"
              className="text-sm font-medium text-sky-600 transition hover:text-sky-700"
            >
              View details
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
            <div className="h-72 min-w-0">
              <Bar data={spendingOverviewData} options={spendingOverviewOptions} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-500">Tracked spending</p>
                <p className="mt-2 text-2xl font-bold text-slate-800">
                  GHS {totalTrackedSpending.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-500">Top spend</p>
                <p className="mt-2 text-lg font-bold text-slate-800">{highestExpense.name}</p>
                <p className="mt-1 text-sm font-semibold text-rose-600">
                  GHS {highestExpense.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  · {highestExpense.category}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">Recent transactions</h2>
            <Link to="/transactions" className="text-sm font-medium text-sky-600 hover:text-sky-700">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {recentTransactions.slice(0, 3).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-800">{transaction.name}</p>
                  <p className="text-sm text-slate-500">{transaction.date}</p>
                </div>

                <p
                  className={`font-semibold ${
                    transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  GHS {transaction.type === 'income' ? '+' : '-'}{Math.abs(transaction.amount).toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard
