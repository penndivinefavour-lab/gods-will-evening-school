'use client'

import { BRANDING_DEFAULTS } from '@/config/branding'

interface FormFieldProps {
  label: string
  name: string
  type?: string
  value?: string | number | boolean | null
  onChange?: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  helpText?: string
  options?: { label: string; value: string }[]
  rows?: number
  children?: React.ReactNode
}

export default function FormField({
  label,
  name,
  type = 'text',
  value = '',
  onChange,
  onBlur,
  placeholder,
  required,
  disabled,
  error,
  helpText,
  options,
  rows,
  children,
}: FormFieldProps) {
  const inputId = `field-${name}`

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    onChange?.(e.target.value)
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium" style={{ color: BRANDING_DEFAULTS.colors.text }}>
        {label}
        {required && <span style={{ color: '#dc2626' }}> *</span>}
      </label>

      {children ? (
        children
      ) : options ? (
        <select
          id={inputId}
          name={name}
          value={String(value ?? '')}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
          style={{
            borderColor: error ? '#dc2626' : '#cbd5e1',
            backgroundColor: disabled ? '#f8fafc' : '#ffffff',
            color: BRANDING_DEFAULTS.colors.text,
          }}
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={inputId}
          name={name}
          value={String(value ?? '')}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows ?? 3}
          className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
          style={{
            borderColor: error ? '#dc2626' : '#cbd5e1',
            backgroundColor: disabled ? '#f8fafc' : '#ffffff',
            color: BRANDING_DEFAULTS.colors.text,
          }}
        />
      ) : (
        <input
          id={inputId}
          name={name}
          type={type}
          value={String(value ?? '')}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
          style={{
            borderColor: error ? '#dc2626' : '#cbd5e1',
            backgroundColor: disabled ? '#f8fafc' : '#ffffff',
            color: BRANDING_DEFAULTS.colors.text,
          }}
        />
      )}

      {error && (
        <p className="text-xs" style={{ color: '#dc2626' }}>
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="text-xs" style={{ color: BRANDING_DEFAULTS.colors.muted }}>
          {helpText}
        </p>
      )}
    </div>
  )
}
