import React from 'react'

const Dashboard = () => {
  const summary = [
    { label: 'Balance', value: 2134.56, tone: 'text-emerald-600', percentageChange: '12.5%' },
    { label: 'Income', value: 4200.0, tone: 'text-sky-600', percentageChange: '8.2%' },
    { label: 'Expenses', value: 1270.44, tone: 'text-rose-600', percentageChange: '-5.7%' },
  ]

  const recentTransactions = [
    { id: 1, name: 'Salary', amount: 320.0, date: '12 Jan', type: 'income' },
    { id: 2, name: 'Groceries', amount: 153.0, date: '28 May', type: 'expense' },
    { id: 3, name: 'Utilities', amount: 3056.0, date: '06 Aug', type: 'expense' },
  ]

  return (
    <>
      <div className="">
        <p className="text-3xl font-bold">Welcome, Kwame.</p>
        <p className="text-lg pt-3 text-muted font-medium pb-10">Here is your financial overview.</p>
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
                ${item.value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="mt-4 text-sm font-medium text-slate-500">{item.percentageChange} since last month</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">Recent transactions</h2>
            <button className="text-sm font-medium text-sky-600 hover:text-sky-700">
              View all
            </button>
          </div>

          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
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
                  {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString(
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