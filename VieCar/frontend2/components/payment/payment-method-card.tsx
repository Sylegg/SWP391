'use client'

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import type { PaymentMethod } from '@/types/payment'

type PaymentMethodCardProps = {
  method: PaymentMethod
  title: string
  description: string
  icon?: ReactNode
  badge?: string
  selected?: boolean
  disabled?: boolean
  onSelect?: (method: PaymentMethod) => void
}

export function PaymentMethodCard({
  method,
  title,
  description,
  icon,
  badge,
  selected = false,
  disabled = false,
  onSelect,
}: PaymentMethodCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onSelect?.(method)}
      className={cn(
        'group flex w-full items-start gap-4 rounded-xl border bg-card p-5 text-left shadow-sm transition-all',
        disabled && 'cursor-not-allowed opacity-60',
        selected
          ? 'border-primary ring-2 ring-primary/10'
          : 'hover:border-primary/80 hover:shadow-md',
      )}
    >
      <div
        className={cn(
          'flex size-12 items-center justify-center rounded-full border text-primary transition-colors',
          selected ? 'bg-primary text-primary-foreground' : 'bg-muted',
        )}
      >
        {icon}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center gap-3">
          <p className="text-base font-semibold text-foreground">{title}</p>
          {badge ? (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {badge}
            </span>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <span
        aria-hidden
        className={cn(
          'mt-1 size-5 rounded-full border-2 transition-colors',
          selected ? 'border-primary bg-primary' : 'border-muted-foreground/30',
        )}
      />
    </button>
  )
}
