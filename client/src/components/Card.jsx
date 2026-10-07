import React from 'react'

const Card = ({ title, subtitle, action, children, className = '' }) => {
  return (
    <section className={['rounded-2xl border border-border bg-surface p-5 shadow-sm', className].join(' ')}>
      {(title || action || subtitle) && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title && <h2 className="text-xl font-semibold text-text">{title}</h2>}
            {subtitle && <p className="mt-1 text-sm font-medium text-muted">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export default Card