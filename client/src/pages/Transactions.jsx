import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import { useToast } from '../components/ToastProvider'
import { useAuth } from '../context/AuthContext'
import { formatDate, getPreferences } from '../utils/preferences'
import { Link } from 'react-router-dom'

const FILTERS = ['All', 'Income', 'Expense']
const EMPTY_FORM = {
  name: '',
  category: '',
  type: 'expense',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  method: '',
  notes: '',
}

const formatCurrency = (value) =>
  `GHS ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const createEmptyForm = () => ({
  ...EMPTY_FORM,
  type: getPreferences().defaultTransactionType,
})

const Transactions = () => {
  const { authorizedFetch } = useAuth()
  const notify = useToast()
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [categoryLoadError, setCategoryLoadError] = useState('')
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [form, setForm] = useState(createEmptyForm)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [deletingTransaction, setDeletingTransaction] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const request = useCallback(
    async (path, { method = 'GET', body, signal } = {}) => {
      const response = await authorizedFetch(path, {
        method,
        signal,
        ...(body
          ? {
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            }
          : {}),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'The request could not be completed.')
      }

      return data
    },
    [authorizedFetch]
  )

  const loadTransactions = useCallback(
    async (signal) => {
      setIsLoading(true)
      setLoadError('')
      try {
        const data = await request('/api/transactions', { signal })
        if (!Array.isArray(data?.transactions)) {
          throw new Error('The API returned an invalid transactions response.')
        }
        setTransactions(data.transactions)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setLoadError(error.message || 'Could not load your transactions.')
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false)
        }
      }
    },
    [request]
  )

  const loadCategories = useCallback(
    async (signal) => {
      setIsLoadingCategories(true)
      setCategoryLoadError('')
      try {
        const data = await request('/api/categories', { signal })
        if (!Array.isArray(data?.categories)) {
          throw new Error('The API returned an invalid categories response.')
        }
        setCategories(data.categories)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setCategoryLoadError(error.message || 'Could not load your categories.')
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoadingCategories(false)
        }
      }
    },
    [request]
  )

  useEffect(() => {
    const controller = new AbortController()
    loadTransactions(controller.signal)
    loadCategories(controller.signal)
    return () => controller.abort()
  }, [loadCategories, loadTransactions])

  const availableCategories = useMemo(
    () => categories.filter((category) => category.type === form.type),
    [categories, form.type]
  )

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    return transactions.filter((transaction) => {
      const matchesType = activeFilter === 'All' || transaction.type === activeFilter.toLowerCase()
      const transactionDate = String(transaction.date).slice(0, 10)
      const matchesDateFrom = !dateFrom || transactionDate >= dateFrom
      const matchesDateTo = !dateTo || transactionDate <= dateTo
      const matchesSearch =
        !normalizedQuery ||
        [transaction.name, transaction.category, transaction.method, transaction.notes]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery))

      return matchesType && matchesDateFrom && matchesDateTo && matchesSearch
    })
  }, [activeFilter, dateFrom, dateTo, searchQuery, transactions])

  const totals = useMemo(
    () =>
      transactions.reduce(
        (result, transaction) => {
          const amount = Number(transaction.amount) || 0
          if (transaction.type === 'income') {
            result.income += amount
          } else {
            result.expenses += amount
          }
          return result
        },
        { income: 0, expenses: 0 }
      ),
    [transactions]
  )
  const net = totals.income - totals.expenses

  const openCreateForm = () => {
    setActionError('')
    setEditingTransaction(null)
    setIsFormOpen(true)
    setForm({ ...createEmptyForm(), date: new Date().toISOString().slice(0, 10) })
  }

  const openEditForm = (transaction) => {
    setActionError('')
    setEditingTransaction(transaction)
    setIsFormOpen(true)
    setForm({
      name: transaction.name || '',
      category: transaction.category || '',
      type: transaction.type || 'expense',
      amount: String(transaction.amount ?? ''),
      date: String(transaction.date).slice(0, 10),
      method: transaction.method || '',
      notes: transaction.notes || '',
    })
  }

  const closeForm = useCallback(() => {
    if (!isSaving) {
      setEditingTransaction(null)
      setIsFormOpen(false)
      setForm(createEmptyForm())
    }
  }, [isSaving])

  useEffect(() => {
    if (!isFormOpen) {
      return undefined
    }

    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !isSaving) {
        closeForm()
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [closeForm, isFormOpen, isSaving])

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => {
      if (name === 'type') {
        const nextCategories = categories.filter((category) => category.type === value)
        const currentCategoryIsValid = nextCategories.some((category) => category.name === currentForm.category)
        return {
          ...currentForm,
          type: value,
          category: currentCategoryIsValid ? currentForm.category : nextCategories[0]?.name || '',
        }
      }
      return { ...currentForm, [name]: value }
    })
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setActionError('')
    setIsSaving(true)
    const isEditing = Boolean(editingTransaction)
    const path = isEditing ? `/api/transactions/${editingTransaction.id}` : '/api/transactions'
    const method = isEditing ? 'PUT' : 'POST'

    try {
      const data = await request(path, {
        method,
        body: { ...form, amount: Number(form.amount) },
      })
      const savedTransaction = data.transaction
      if (!savedTransaction || savedTransaction.id === undefined || savedTransaction.id === null) {
        throw new Error('The API returned an invalid transaction response.')
      }
      setTransactions((currentTransactions) =>
        isEditing
          ? currentTransactions.map((transaction) =>
              String(transaction.id) === String(savedTransaction.id) ? savedTransaction : transaction
            )
          : [savedTransaction, ...currentTransactions]
      )
      setEditingTransaction(null)
      setIsFormOpen(false)
      setForm(createEmptyForm())
      notify(isEditing ? 'Transaction updated.' : 'Transaction created.')
    } catch (error) {
      setActionError(error.message || 'Could not save this transaction.')
      notify(error.message || 'Could not save this transaction.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingTransaction) {
      return
    }

    setActionError('')
    setIsDeleting(true)
    try {
      const data = await request(`/api/transactions/${deletingTransaction.id}`, { method: 'DELETE' })
      if (data?.success !== true) {
        throw new Error('The API returned an invalid delete response.')
      }
      setTransactions((currentTransactions) =>
        currentTransactions.filter((transaction) => String(transaction.id) !== String(deletingTransaction.id))
      )
      setDeletingTransaction(null)
      notify('Transaction deleted.')
    } catch (error) {
      setActionError(error.message || 'Could not delete this transaction.')
      notify(error.message || 'Could not delete this transaction.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const clearDateFilters = () => {
    setDateFrom('')
    setDateTo('')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text sm:text-3xl">Transactions</h1>
          <p className="mt-2 text-base font-medium text-muted">Review your cash flow and activity history.</p>
        </div>
        <Button onClick={openCreateForm} className="h-11 gap-2 rounded-xl px-5">
          <Plus size={18} />
          Add transaction
        </Button>
      </div>

      {actionError && (
        <div role="alert" className="flex items-start justify-between gap-4 rounded-xl border border-error/30 bg-rose-50 px-4 py-3 text-sm font-medium text-error">
          <span>{actionError}</span>
          <button type="button" aria-label="Dismiss error" onClick={() => setActionError('')}>
            <X size={18} />
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm font-medium text-muted">Income</p>
          <p className="mt-3 break-words text-2xl font-bold text-emerald-600 sm:text-3xl">
            {formatCurrency(totals.income)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-medium text-muted">Expenses</p>
          <p className="mt-3 break-words text-2xl font-bold text-rose-600 sm:text-3xl">
            {formatCurrency(totals.expenses)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-medium text-muted">Net</p>
          <p className={`mt-3 break-words text-2xl font-bold sm:text-3xl ${net >= 0 ? 'text-primary' : 'text-error'}`}>
            {formatCurrency(net)}
          </p>
        </Card>
      </div>

      <Card title="All transactions" subtitle="Search, filter, and manage your activity.">
        <div className="mb-5 space-y-4">
          <label className="relative block">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search name, category, or payment method"
              aria-label="Search transactions"
              className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-4 text-sm text-text outline-none transition placeholder:text-muted/80 focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2" aria-label="Transaction type filter">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={activeFilter === filter}
                  onClick={() => setActiveFilter(filter)}
                  className={[
                    'rounded-full px-4 py-2 text-sm font-semibold transition',
                    activeFilter === filter ? 'bg-primary text-white' : 'bg-slate-100 text-muted hover:bg-slate-200',
                  ].join(' ')}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted">
                <CalendarDays size={17} />
                Date range
              </div>
              <label className="text-xs font-semibold text-muted">
                From
                <input
                  aria-label="Filter from date"
                  type="date"
                  value={dateFrom}
                  max={dateTo || undefined}
                  onChange={(event) => setDateFrom(event.target.value)}
                  className="mt-1 block h-10 rounded-lg border border-border bg-white px-2 text-sm text-text"
                />
              </label>
              <label className="text-xs font-semibold text-muted">
                To
                <input
                  aria-label="Filter to date"
                  type="date"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(event) => setDateTo(event.target.value)}
                  className="mt-1 block h-10 rounded-lg border border-border bg-white px-2 text-sm text-text"
                />
              </label>
              {(dateFrom || dateTo) && (
                <button
                  type="button"
                  onClick={clearDateFilters}
                  className="h-10 text-left text-sm font-semibold text-primary hover:text-primary/80"
                >
                  Clear dates
                </button>
              )}
            </div>
          </div>
        </div>

        {loadError ? (
          <div role="alert" className="rounded-2xl border border-error/30 bg-rose-50 p-6 text-center">
            <p className="font-semibold text-error">Transactions could not be loaded</p>
            <p className="mt-2 text-sm text-muted">{loadError}</p>
            <Button variant="muted" onClick={() => loadTransactions()} className="mt-4">
              Try again
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-muted" role="status">
            <LoaderCircle size={28} className="animate-spin text-primary" />
            <span className="text-sm font-medium">Loading your transactions...</span>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-slate-50 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Search size={20} />
            </div>
            <p className="mt-4 font-semibold text-text">
              {transactions.length === 0 ? 'No transactions yet' : 'No matching transactions'}
            </p>
            <p className="mt-1 max-w-md text-sm text-muted">
              {transactions.length === 0
                ? 'Add your first transaction to start tracking income and expenses.'
                : 'Try changing your search or filters to find what you need.'}
            </p>
            {transactions.length === 0 && (
              <Button onClick={openCreateForm} className="mt-4 gap-2">
                <Plus size={17} />
                Add transaction
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[740px] border-collapse text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-bold">Transaction</th>
                  <th scope="col" className="px-4 py-3 font-bold">Category</th>
                  <th scope="col" className="px-4 py-3 font-bold">Date</th>
                  <th scope="col" className="px-4 py-3 text-right font-bold">Amount</th>
                  <th scope="col" className="px-4 py-3 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="transition hover:bg-slate-50/80">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={[
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                            transaction.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700',
                          ].join(' ')}
                        >
                          {transaction.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                        </span>
                        <div>
                          <p className="font-semibold text-text">{transaction.name}</p>
                          {transaction.method && <p className="mt-0.5 text-xs font-medium text-muted">{transaction.method}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-muted">
                        {transaction.category}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-muted">
                      {formatDate(transaction.date)}
                    </td>
                    <td className={`whitespace-nowrap px-4 py-4 text-right font-bold ${transaction.type === 'income' ? 'text-emerald-600' : 'text-text'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditForm(transaction)}
                          aria-label={`Edit ${transaction.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActionError('')
                            setDeletingTransaction(transaction)
                          }}
                          aria-label={`Delete ${transaction.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-rose-50 hover:text-error focus-visible:outline-2 focus-visible:outline-error"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loadError && !isLoading && transactions.length > 0 && (
          <p className="mt-3 text-right text-xs font-medium text-muted">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </p>
        )}
      </Card>

      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm()
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-form-title"
            className="my-auto w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="transaction-form-title" className="text-xl font-bold text-text">
                  {editingTransaction ? 'Edit transaction' : 'Add transaction'}
                </h2>
                <p className="mt-1 text-sm text-muted">Enter the details of this money activity.</p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                aria-label="Close transaction form"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {actionError && (
                <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-error">
                  {actionError}
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="transaction-name"
                  name="name"
                  label="Name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Grocery shopping"
                  maxLength={120}
                  required
                />
                <div>
                  <label htmlFor="transaction-category" className="mb-2 block text-sm font-semibold text-text">
                    Category
                  </label>
                  <select
                    id="transaction-category"
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    required
                    disabled={isLoadingCategories || availableCategories.length === 0}
                    className="h-12 w-full rounded-lg border border-border bg-white px-3 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value="">
                      {isLoadingCategories ? 'Loading categories…' : 'Select a category'}
                    </option>
                    {availableCategories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {categoryLoadError ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-error">
                      <span>{categoryLoadError}</span>
                      <button type="button" className="underline" onClick={() => loadCategories()}>
                        Retry
                      </button>
                    </div>
                  ) : !isLoadingCategories && availableCategories.length === 0 ? (
                    <p className="mt-2 text-xs font-medium text-muted">
                      No {form.type} categories yet.{' '}
                      <Link to="/categories" className="font-bold text-primary underline">
                        Create one first
                      </Link>
                      .
                    </p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="transaction-type" className="mb-2 block text-sm font-semibold text-text">
                    Type
                  </label>
                  <select
                    id="transaction-type"
                    name="type"
                    value={form.type}
                    onChange={handleFormChange}
                    className="h-12 w-full rounded-lg border border-border bg-white px-3 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <Input
                  id="transaction-amount"
                  name="amount"
                  label="Amount (GHS)"
                  type="number"
                  value={form.amount}
                  onChange={handleFormChange}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                />
                <Input
                  id="transaction-date"
                  name="date"
                  label="Date"
                  type="date"
                  value={form.date}
                  onChange={handleFormChange}
                  required
                />
                <Input
                  id="transaction-method"
                  name="method"
                  label="Payment method (optional)"
                  value={form.method}
                  onChange={handleFormChange}
                  placeholder="e.g. Debit card"
                  maxLength={80}
                />
              </div>
              <div>
                <label htmlFor="transaction-notes" className="mb-2 block text-sm font-semibold text-text">
                  Notes (optional)
                </label>
                <textarea
                  id="transaction-notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleFormChange}
                  maxLength={500}
                  rows={3}
                  placeholder="Add a note about this transaction"
                  className="w-full resize-y rounded-lg border border-border bg-white px-3 py-2.5 text-text outline-none transition placeholder:text-muted/80 focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button variant="muted" onClick={closeForm} disabled={isSaving}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving || isLoadingCategories || availableCategories.length === 0}
                  className="gap-2"
                >
                  {isSaving && <LoaderCircle size={17} className="animate-spin" />}
                  {isSaving ? 'Saving...' : editingTransaction ? 'Save changes' : 'Create transaction'}
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deletingTransaction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeleting) {
              setDeletingTransaction(null)
            }
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-transaction-title"
            aria-describedby="delete-transaction-description"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-error">
              <Trash2 size={21} />
            </div>
            <h2 id="delete-transaction-title" className="mt-4 text-xl font-bold text-text">
              Delete transaction?
            </h2>
            <p id="delete-transaction-description" className="mt-2 text-sm leading-6 text-muted">
              This will permanently delete <span className="font-semibold text-text">{deletingTransaction.name}</span>.
              This action cannot be undone.
            </p>
            {actionError && <p role="alert" className="mt-3 text-sm font-medium text-error">{actionError}</p>}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="muted"
                disabled={isDeleting}
                onClick={() => setDeletingTransaction(null)}
              >
                Cancel
              </Button>
              <Button variant="danger" disabled={isDeleting} onClick={handleDelete} className="gap-2">
                {isDeleting && <LoaderCircle size={17} className="animate-spin" />}
                {isDeleting ? 'Deleting...' : 'Delete transaction'}
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default Transactions
