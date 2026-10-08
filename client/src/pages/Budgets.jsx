import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  CircleDollarSign,
  LoaderCircle,
  Pencil,
  Plus,
  Target,
  Trash2,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ToastProvider'

const currentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}
const EMPTY_FORM = { category: '', limit: '', month: currentMonth() }

const formatCurrency = (value) =>
  `GHS ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const formatMonth = (month) => {
  const [year, monthNumber] = month.split('-').map(Number)
  return new Date(year, monthNumber - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

const Budgets = () => {
  const { authorizedFetch } = useAuth()
  const notify = useToast()
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [month, setMonth] = useState(currentMonth)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [deletingBudget, setDeletingBudget] = useState(null)
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

  const loadBudgets = useCallback(
    async (signal) => {
      setIsLoading(true)
      setLoadError('')
      try {
        const [budgetData, categoryData] = await Promise.all([
          request(`/api/budgets?month=${encodeURIComponent(month)}`, { signal }),
          request('/api/categories', { signal }),
        ])
        if (!Array.isArray(budgetData?.budgets) || !Array.isArray(categoryData?.categories)) {
          throw new Error('The API returned an invalid budgets or categories response.')
        }
        setBudgets(budgetData.budgets)
        setCategories(categoryData.categories.filter((category) => category.type === 'expense'))
      } catch (error) {
        if (error.name !== 'AbortError') {
          setLoadError(error.message || 'Could not load your budgets.')
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false)
        }
      }
    },
    [month, request]
  )

  useEffect(() => {
    const controller = new AbortController()
    loadBudgets(controller.signal)
    return () => controller.abort()
  }, [loadBudgets])

  const totals = useMemo(
    () =>
      budgets.reduce(
        (result, budget) => {
          result.limit += Number(budget.limit) || 0
          result.spent += Number(budget.spent) || 0
          result.remaining += Number(budget.remaining) || 0
          return result
        },
        { limit: 0, spent: 0, remaining: 0 }
      ),
    [budgets]
  )

  const openCreateForm = () => {
    setActionError('')
    setEditingBudget(null)
    const usedCategories = new Set(budgets.map((budget) => budget.category.toLowerCase()))
    const nextCategory = categories.find((category) => !usedCategories.has(category.name.toLowerCase()))
    setForm({ ...EMPTY_FORM, category: nextCategory?.name || '', month })
    setIsFormOpen(true)
  }

  const openEditForm = (budget) => {
    setActionError('')
    setEditingBudget(budget)
    setForm({ category: budget.category, limit: String(budget.limit), month: budget.month })
    setIsFormOpen(true)
  }

  const closeForm = useCallback(() => {
    if (!isSaving) {
      setIsFormOpen(false)
      setEditingBudget(null)
      setForm({ ...EMPTY_FORM, month })
    }
  }, [isSaving, month])

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
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setActionError('')
    if (!categories.some((category) => category.name === form.category)) {
      setActionError('Select one of your expense categories.')
      return
    }
    const amountLimit = Number(form.limit)
    if (!Number.isFinite(amountLimit) || amountLimit <= 0) {
      setActionError('Enter a monthly limit greater than zero.')
      return
    }

    setIsSaving(true)
    const isEditing = Boolean(editingBudget)
    const path = isEditing ? `/api/budgets/${encodeURIComponent(editingBudget.id)}` : '/api/budgets'
    try {
      const data = await request(path, {
        method: isEditing ? 'PUT' : 'POST',
        body: { category: form.category, limit: amountLimit, month: form.month },
      })
      const savedBudget = data?.budget
      if (!savedBudget || savedBudget.id === undefined || savedBudget.id === null) {
        throw new Error('The API returned an invalid budget response.')
      }

      if (form.month === month) {
        setBudgets((currentBudgets) =>
          isEditing
            ? currentBudgets.map((budget) =>
                String(budget.id) === String(savedBudget.id) ? savedBudget : budget
              )
            : [...currentBudgets, savedBudget].sort((a, b) => a.category.localeCompare(b.category))
        )
      } else {
        setMonth(form.month)
      }
      setIsFormOpen(false)
      setEditingBudget(null)
      notify(isEditing ? 'Budget updated.' : 'Budget created.')
    } catch (error) {
      setActionError(error.message || 'Could not save this budget.')
      notify(error.message || 'Could not save this budget.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingBudget) {
      return
    }
    setActionError('')
    setIsDeleting(true)
    try {
      const data = await request(`/api/budgets/${encodeURIComponent(deletingBudget.id)}`, {
        method: 'DELETE',
      })
      if (data?.success !== true) {
        throw new Error('The API returned an invalid delete response.')
      }
      setBudgets((currentBudgets) =>
        currentBudgets.filter((budget) => String(budget.id) !== String(deletingBudget.id))
      )
      setDeletingBudget(null)
      notify('Budget deleted.')
    } catch (error) {
      setActionError(error.message || 'Could not delete this budget.')
      notify(error.message || 'Could not delete this budget.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const availableCategories = useMemo(() => {
    const currentName = editingBudget?.category.toLowerCase()
    const assigned = new Set(
      budgets
        .filter((budget) => String(budget.id) !== String(editingBudget?.id))
        .map((budget) => budget.category.toLowerCase())
    )
    return categories.filter(
      (category) => !assigned.has(category.name.toLowerCase()) || category.name.toLowerCase() === currentName
    )
  }, [budgets, categories, editingBudget])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text sm:text-3xl">Budgets</h1>
          <p className="mt-2 text-base font-medium text-muted">Set how much you want to spend in each category each month.</p>
        </div>
        <Button onClick={openCreateForm} disabled={categories.length === 0} className="h-11 gap-2 px-5">
          <Plus size={18} />
          Add budget
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted">
          <CalendarDays size={18} />
          Month
        </div>
        <input
          aria-label="Select budget month"
          type="month"
          value={month}
          onChange={(event) => {
            if (event.target.value) {
              setMonth(event.target.value)
            }
          }}
          className="h-11 rounded-lg border border-border bg-white px-3 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </div>

      {actionError && !isFormOpen && (
        <div role="alert" className="flex items-start justify-between gap-4 rounded-xl border border-error/30 bg-rose-50 px-4 py-3 text-sm font-medium text-error">
          <span>{actionError}</span>
          <button type="button" aria-label="Dismiss error" onClick={() => setActionError('')}>
            <X size={18} />
          </button>
        </div>
      )}

      {loadError ? (
        <Card className="p-6">
          <div role="alert" className="text-center">
            <p className="font-semibold text-error">Your budgets couldn’t be loaded</p>
            <p className="mt-2 text-sm text-muted">{loadError}</p>
            <Button variant="muted" onClick={() => loadBudgets()} className="mt-4">Try again</Button>
          </div>
        </Card>
      ) : isLoading ? (
        <Card className="flex min-h-64 flex-col items-center justify-center gap-3 text-muted" role="status">
          <LoaderCircle size={28} className="animate-spin text-primary" />
          <span className="text-sm font-medium">Loading your budgets...</span>
        </Card>
      ) : budgets.length === 0 ? (
        <Card className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Target size={21} />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-text">No budgets for {formatMonth(month)}</h2>
          <p className="mt-1 max-w-md text-sm text-muted">
            {categories.length
              ? 'Set a monthly spending limit for a category to help stay on track.'
              : 'First, add an expense category. Then you can set a monthly spending limit for it.'}
          </p>
          {categories.length ? (
            <Button onClick={openCreateForm} className="mt-4 gap-2">
              <Plus size={17} />
              Create budget
            </Button>
          ) : (
            <Link to="/categories" className="mt-4 text-sm font-semibold text-primary hover:text-primary/80">
              Create expense category
            </Link>
          )}
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CircleDollarSign size={19} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted">Total monthly budget</p>
                  <p className="text-xl font-bold text-text">{formatCurrency(totals.limit)}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                  <Target size={19} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted">Amount spent</p>
                  <p className="text-xl font-bold text-text">{formatCurrency(totals.spent)}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 sm:col-span-2 xl:col-span-1">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <CircleDollarSign size={19} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted">Remaining</p>
                  <p className="text-xl font-bold text-text">{formatCurrency(totals.remaining)}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {budgets.map((budget) => {
              const limit = Number(budget.limit) || 0
              const spent = Number(budget.spent) || 0
              const remaining = Number(budget.remaining) || 0
              const percentage = limit > 0 ? (spent / limit) * 100 : 0
              const progressWidth = Math.min(percentage, 100)
              const isOverBudget = spent > limit
              return (
                <Card key={budget.id} className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={[
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                        isOverBudget ? 'bg-rose-100 text-rose-700' : 'bg-primary/10 text-primary',
                      ].join(' ')}>
                        <Target size={19} />
                      </div>
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-text">{budget.category}</h2>
                        <p className="text-sm font-medium text-muted">{formatMonth(budget.month)}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 self-end sm:self-start">
                      <button
                        type="button"
                        onClick={() => openEditForm(budget)}
                        aria-label={`Edit ${budget.category} budget`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActionError('')
                          setDeletingBudget(budget)
                        }}
                        aria-label={`Delete ${budget.category} budget`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-rose-50 hover:text-error focus-visible:outline-2 focus-visible:outline-error"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-muted">Spent</p>
                      <p className="mt-1 text-xl font-bold text-text">{formatCurrency(spent)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-muted">Monthly limit</p>
                      <p className="mt-1 text-lg font-bold text-text">{formatCurrency(limit)}</p>
                    </div>
                  </div>

                  <div
                    className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100"
                    role="progressbar"
                    aria-label={`${budget.category} budget spent`}
                    aria-valuemin="0"
                    aria-valuemax={limit}
                    aria-valuenow={Math.min(spent, limit)}
                    aria-valuetext={`${formatCurrency(spent)} spent of ${formatCurrency(limit)}`}
                  >
                    <div
                      className={`h-full rounded-full transition-all ${isOverBudget ? 'bg-error' : 'bg-primary'}`}
                      style={{ width: `${progressWidth}%` }}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className={`font-semibold ${isOverBudget ? 'text-error' : 'text-muted'}`}>
                      {Math.round(percentage)}% used
                    </span>
                    <span className={`font-bold ${isOverBudget ? 'text-error' : 'text-emerald-700'}`}>
                      {isOverBudget
                        ? `${formatCurrency(spent - limit)} over budget`
                        : `${formatCurrency(remaining)} remaining`}
                    </span>
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}

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
            aria-labelledby="budget-form-title"
            className="my-auto w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="budget-form-title" className="text-xl font-bold text-text">
                  {editingBudget ? 'Edit budget' : 'Create budget'}
                </h2>
                <p className="mt-1 text-sm text-muted">Choose a category and set how much you want to spend this month.</p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                aria-label="Close budget form"
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
              <div>
                <label htmlFor="budget-category" className="mb-2 block text-sm font-semibold text-text">
                  Category
                </label>
                <select
                  id="budget-category"
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                  required
                  disabled={availableCategories.length === 0}
                  className="h-12 w-full rounded-lg border border-border bg-white px-3 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-slate-50"
                >
                  <option value="" disabled>Select a category</option>
                  {availableCategories.map((category) => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>
              <Input
                id="budget-monthly-limit"
                name="limit"
                label="Monthly limit (GHS)"
                type="number"
                value={form.limit}
                onChange={handleFormChange}
                placeholder="0.00"
                min="0.01"
                max="9999999999.99"
                step="0.01"
                required
              />
              <Input
                id="budget-month"
                name="month"
                label="Month"
                type="month"
                value={form.month}
                onChange={handleFormChange}
                required
              />
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button variant="muted" onClick={closeForm} disabled={isSaving}>Cancel</Button>
                <Button
                  type="submit"
                  disabled={isSaving || availableCategories.length === 0}
                  className="gap-2"
                >
                  {isSaving && <LoaderCircle size={17} className="animate-spin" />}
                  {isSaving ? 'Saving...' : editingBudget ? 'Save changes' : 'Create budget'}
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deletingBudget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeleting) {
              setDeletingBudget(null)
            }
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-budget-title"
            aria-describedby="delete-budget-description"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-error">
              <Trash2 size={21} />
            </div>
            <h2 id="delete-budget-title" className="mt-4 text-xl font-bold text-text">Delete budget?</h2>
            <p id="delete-budget-description" className="mt-2 text-sm leading-6 text-muted">
              Delete the {formatMonth(deletingBudget.month)} budget for{' '}
              <span className="font-semibold text-text">{deletingBudget.category}</span>?
            </p>
            {actionError && <p role="alert" className="mt-3 text-sm font-medium text-error">{actionError}</p>}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="muted" disabled={isDeleting} onClick={() => setDeletingBudget(null)}>Cancel</Button>
              <Button variant="danger" disabled={isDeleting} onClick={handleDelete} className="gap-2">
                {isDeleting && <LoaderCircle size={17} className="animate-spin" />}
                {isDeleting ? 'Deleting...' : 'Delete budget'}
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default Budgets
