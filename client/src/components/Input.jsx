import React from 'react'

const Input = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-2 block text-sm font-semibold text-text">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={[
          'h-12 w-full rounded-lg border bg-white px-3 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15',
          error ? 'border-error' : 'border-border',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <p className="mt-2 text-xs font-medium text-error">{error}</p>}
    </div>
  )
}

export default Input