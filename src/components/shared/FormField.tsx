import React from 'react'

import { cn } from '@/utils'

/**
 * Standardized form field wrapper with label and optional hint text.
 * Keeps form layout consistent while letting UI primitives (Input, Textarea, etc.)
 * own their own styling.
 */
export interface FormFieldProps {
  label: string
  hint?: string
  htmlFor?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}

export function FormField({ label, hint, htmlFor, required, className, children }: FormFieldProps) {
  return (
    <label htmlFor={htmlFor} className={cn('block space-y-1.5', className)}>
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
      </span>

      {children}

      {hint ? (
        <span className="block text-xs text-slate-400 dark:text-slate-500">{hint}</span>
      ) : null}
    </label>
  )
}
