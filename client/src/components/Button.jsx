import React from 'react'

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  ...props
}) => {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-mint text-text hover:bg-mint/90',
    muted: 'bg-slate-100 text-text hover:bg-slate-200',
    danger: 'bg-error text-white hover:bg-error/90',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-70',
        variants[variant] || variants.primary,
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button