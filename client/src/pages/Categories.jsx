import { useCallback, useEffect, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, LoaderCircle, Pencil, Plus, Trash2, X } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import { useToast } from '../components/ToastProvider'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const EMPTY_FORM = { name: '', type: 'expense' }

const Categories = () => {
  const { session } = useAuth()
  const notify = useToast()
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [deletingCategory, setDeletingCategory] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const request = useCallback(
    async (path, { method = 'GET', body, signal } = {}) => {
      if (!session?.access_token) {
        throw new Error('Your session has expired. Please sign in again.')
      }

      let response
      try {
        response = await fetch(`${API_BASE_URL}${path}`, {
          method,
          signal,
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            ...(body ? { 'Content-Type': 'application/json' } : {}),
          },
          ...(body ? { body: JSON.stringify(body) } : {}),
        })
      } catch (error) {
        if (error.name === 'AbortError') {
          throw error
        }
        throw new Error(`Cannot reach API server at ${API_BASE_URL}`)
      }

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'The request could not be completed.')
      }
      return data
    },
    [session?.access_token]
  )

  const loadCategories = useCallback(
    async (signal) => {
      setIsLoading(true)
      setLoadError('')
      try {
        const data = await request('/api/categories', { signal })
        if (!Array.isArray(data?.categories)) {
          throw new Error('The API returned an invalid categories response.')
        }
        setCategories(data.categories)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setLoadError(error.message || 'Could not load your categories.')
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false)
        }
      }
    },
    [request]
  )

  useEffect(() => {
    const controller = new AbortController()
    loadCategories(controller.signal)
    return () => controller.abort()
  }, [loadCategories])

  const openCreateForm = () => {
    setActionError('')
    setEditingCategory(null)
    setForm(EMPTY_FORM)
    setIsFormOpen(true)
  }

  const openEditForm = (category) => {
    setActionError('')
    setEditingCategory(category)
    setForm({ name: category.name || '', type: category.type || 'expense' })
    setIsFormOpen(true)
  }

  const closeForm = useCallback(() => {
    if (!isSaving) {
      setEditingCategory(null)
      setIsFormOpen(false)
      setForm(EMPTY_FORM)
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
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setActionError('')
    setIsSaving(true)
    const isEditing = Boolean(editingCategory)
    const path = isEditing ? `/api/categories/${encodeURIComponent(editingCategory.id)}` : '/api/categories'

    try {
      const data = await request(path, {
        method: isEditing ? 'PUT' : 'POST',
        body: { name: form.name.trim(), type: form.type },
      })
      const savedCategory = data.category
      if (!savedCategory || savedCategory.id === undefined || savedCategory.id === null) {
        throw new Error('The API returned an invalid category response.')
      }
      setCategories((currentCategories) =>
        isEditing
          ? currentCategories.map((category) =>
              String(category.id) === String(savedCategory.id) ? savedCategory : category
            )
          : [savedCategory, ...currentCategories]
      )
      setIsFormOpen(false)
      setEditingCategory(null)
      setForm(EMPTY_FORM)
      notify(isEditing ? 'Category updated.' : 'Category created.')
    } catch (error) {
      setActionError(error.message || 'Could not save this category.')
      notify(error.message || 'Could not save this category.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingCategory) {
      return
    }
    setActionError('')
    setIsDeleting(true)
    try {
      const data = await request(`/api/categories/${encodeURIComponent(deletingCategory.id)}`, {
        method: 'DELETE',
      })
      if (data?.success !== true) {
        throw new Error('The API returned an invalid delete response.')
      }
      setCategories((currentCategories) =>
        currentCategories.filter((category) => String(category.id) !== String(deletingCategory.id))
      )
      setDeletingCategory(null)
      notify('Category deleted.')
    } catch (error) {
      setActionError(error.message || 'Could not delete this category.')
      notify(error.message || 'Could not delete this category.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const incomeCategories = categories.filter((category) => category.type === 'income')
  const expenseCategories = categories.filter((category) => category.type === 'expense')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text sm:text-3xl">Categories</h1>
          <p className="mt-2 text-base font-medium text-muted">Organize your income and expenses.</p>
        </div>
        <Button onClick={openCreateForm} className="h-11 gap-2 px-5">
          <Plus size={18} />
          Add category
        </Button>
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
            <p className="font-semibold text-error">Categories could not be loaded</p>
            <p className="mt-2 text-sm text-muted">{loadError}</p>
            <Button variant="muted" onClick={() => loadCategories()} className="mt-4">
              Try again
            </Button>
          </div>
        </Card>
      ) : isLoading ? (
        <Card className="flex min-h-64 flex-col items-center justify-center gap-3 text-muted">
          <LoaderCircle size={28} className="animate-spin text-primary" />
          <span className="text-sm font-medium">Loading your categories...</span>
        </Card>
      ) : categories.length === 0 ? (
        <Card className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Plus size={21} />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-text">No categories yet</h2>
          <p className="mt-1 max-w-md text-sm text-muted">
            Create categories to organize the income and expenses you record.
          </p>
          <Button onClick={openCreateForm} className="mt-4 gap-2">
            <Plus size={17} />
            Create category
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {[
            { title: 'Expense categories', items: expenseCategories, type: 'expense' },
            { title: 'Income categories', items: incomeCategories, type: 'income' },
          ].map(({ title, items, type }) => (
            <Card key={type} title={title} subtitle={`${items.length} ${items.length === 1 ? 'category' : 'categories'}`}>
              {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-slate-50 px-4 py-8 text-center">
                  <p className="text-sm font-medium text-muted">No {type} categories yet.</p>
                  <button
                    type="button"
                    onClick={() => {
                      openCreateForm()
                      setForm({ ...EMPTY_FORM, type })
                    }}
                    className="mt-2 text-sm font-semibold text-primary hover:text-primary/80"
                  >
                    Add one
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {items.map((category) => (
                    <li key={category.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className={[
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                          type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700',
                        ].join(' ')}>
                          {type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-text">{category.name}</p>
                          <p className="text-xs font-medium capitalize text-muted">{category.type}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => openEditForm(category)}
                          aria-label={`Edit ${category.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActionError('')
                            setDeletingCategory(category)
                          }}
                          aria-label={`Delete ${category.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-rose-50 hover:text-error focus-visible:outline-2 focus-visible:outline-error"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>
      )}

      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm()
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-form-title"
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="category-form-title" className="text-xl font-bold text-text">
                  {editingCategory ? 'Edit category' : 'Add category'}
                </h2>
                <p className="mt-1 text-sm text-muted">Choose a name and transaction type.</p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                aria-label="Close category form"
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
              <Input
                id="category-name"
                name="name"
                label="Name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="e.g. Groceries"
                maxLength={80}
                required
              />
              <div>
                <label htmlFor="category-type" className="mb-2 block text-sm font-semibold text-text">
                  Type
                </label>
                <select
                  id="category-type"
                  name="type"
                  value={form.type}
                  onChange={handleFormChange}
                  className="h-12 w-full rounded-lg border border-border bg-white px-3 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button variant="muted" onClick={closeForm} disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="gap-2">
                  {isSaving && <LoaderCircle size={17} className="animate-spin" />}
                  {isSaving ? 'Saving...' : editingCategory ? 'Save changes' : 'Create category'}
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deletingCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeleting) {
              setDeletingCategory(null)
            }
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-category-title"
            aria-describedby="delete-category-description"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-error">
              <Trash2 size={21} />
            </div>
            <h2 id="delete-category-title" className="mt-4 text-xl font-bold text-text">
              Delete category?
            </h2>
            <p id="delete-category-description" className="mt-2 text-sm leading-6 text-muted">
              Delete <span className="font-semibold text-text">{deletingCategory.name}</span>? Existing transactions
              keep their saved category label.
            </p>
            {actionError && <p role="alert" className="mt-3 text-sm font-medium text-error">{actionError}</p>}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="muted" disabled={isDeleting} onClick={() => setDeletingCategory(null)}>
                Cancel
              </Button>
              <Button variant="danger" disabled={isDeleting} onClick={handleDelete} className="gap-2">
                {isDeleting && <LoaderCircle size={17} className="animate-spin" />}
                {isDeleting ? 'Deleting...' : 'Delete category'}
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default Categories
