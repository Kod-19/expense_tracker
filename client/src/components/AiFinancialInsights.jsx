import React, { useCallback, useEffect, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  LoaderCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import Card from './Card'
import { useAuth } from '../context/AuthContext'

const AiFinancialInsights = ({ className = '' }) => {
  const { authorizedFetch } = useAuth()
  const [insights, setInsights] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState('')

  const fetchInsights = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError('')

      try {
        const response = await authorizedFetch('/api/ai/insights')
        const data = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(data?.message || 'Could not load AI financial insights.')
        }

        if (data?.insights) {
          setInsights(data.insights)
        }
      } catch (err) {
        setError(err.message || 'AI financial insights currently unavailable.')
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [authorizedFetch]
  )

  useEffect(() => {
    fetchInsights()
  }, [fetchInsights])

  const getScoreBadgeColor = (status = '') => {
    switch (status.toLowerCase()) {
      case 'excellent':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'good':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'fair':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200'
    }
  }

  const getObservationIcon = (type = '') => {
    switch (type) {
      case 'positive':
        return <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
      case 'warning':
        return <AlertTriangle size={16} className="shrink-0 text-amber-600" />
      default:
        return <Lightbulb size={16} className="shrink-0 text-indigo-600" />
    }
  }

  if (error && !insights) {
    return null
  }

  return (
    <Card
      className={[
        'overflow-hidden border border-slate-200/80 bg-gradient-to-br from-white via-indigo-50/20 to-slate-50/60 p-5 shadow-sm',
        className,
      ].join(' ')}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-primary" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI Financial Health & Insights</h3>
            <p className="text-xs text-slate-500">
              Personalized advice based on your spending, savings, and budgets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {insights?.status && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${getScoreBadgeColor(
                insights.status
              )}`}
            >
              <span>Score: {insights.healthScore ?? 75}/100</span>
              <span className="opacity-60">·</span>
              <span>{insights.status}</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => fetchInsights(true)}
            disabled={isLoading || isRefreshing}
            title="Refresh AI Insights"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? 'animate-spin text-primary' : ''}
            />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[90px] items-center justify-center gap-2.5 text-xs text-slate-500">
          <LoaderCircle size={18} className="animate-spin text-primary" />
          <span>Analyzing your cash flow and generating insights...</span>
        </div>
      ) : (
        <div className="pt-3.5">
          {insights?.headline && (
            <p className="mb-3 text-xs font-semibold text-slate-700 sm:text-sm">
              💡 {insights.headline}
            </p>
          )}

          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {insights?.observations?.map((obs, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-100 bg-white/90 p-3 shadow-xs transition hover:border-slate-200"
              >
                <div className="flex items-center gap-1.5">
                  {getObservationIcon(obs.type)}
                  <h4 className="text-xs font-bold text-slate-800">{obs.title}</h4>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {obs.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

export default AiFinancialInsights

