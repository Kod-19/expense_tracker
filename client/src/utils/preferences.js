const STORAGE_KEY = 'expense_tracker_preferences'

export const DEFAULT_PREFERENCES = {
  dateFormat: 'DD/MM/YYYY',
  defaultTransactionType: 'expense',
}

export const getPreferences = () => {
  try {
    const storedPreferences = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')

    return {
      dateFormat: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].includes(storedPreferences.dateFormat)
        ? storedPreferences.dateFormat
        : DEFAULT_PREFERENCES.dateFormat,
      defaultTransactionType: ['expense', 'income'].includes(storedPreferences.defaultTransactionType)
        ? storedPreferences.defaultTransactionType
        : DEFAULT_PREFERENCES.defaultTransactionType,
    }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

export const savePreferences = (preferences) => {
  const nextPreferences = {
    dateFormat: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].includes(preferences.dateFormat)
      ? preferences.dateFormat
      : DEFAULT_PREFERENCES.dateFormat,
    defaultTransactionType: ['expense', 'income'].includes(preferences.defaultTransactionType)
      ? preferences.defaultTransactionType
      : DEFAULT_PREFERENCES.defaultTransactionType,
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPreferences))
  return nextPreferences
}

export const formatDate = (value) => {
  const [year, month, day] = String(value).slice(0, 10).split('-')
  const { dateFormat } = getPreferences()

  if (!year || !month || !day) {
    return String(value)
  }

  if (dateFormat === 'MM/DD/YYYY') {
    return `${month}/${day}/${year}`
  }

  if (dateFormat === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`
  }

  return `${day}/${month}/${year}`
}
