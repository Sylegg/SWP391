import type { ReactNode } from 'react'

import { TrendingDown, TrendingUp } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface PaymentStatCardProps {
  title: string
  value: string
  description?: string
  icon?: ReactNode
  trendLabel?: string
  trendDirection?: 'up' | 'down'
  className?: string
}

export function PaymentStatCard({
  title,
  value,
  description,
  icon,
  trendLabel,
  trendDirection = 'up',
  className,
}: PaymentStatCardProps) {
  const TrendIcon = trendDirection === 'down' ? TrendingDown : TrendingUp

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardDescription>{title}</CardDescription>
          <CardTitle className="mt-1 text-2xl font-semibold">{value}</CardTitle>
        </div>
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {trendLabel ? (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                trendDirection === 'down' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600',
              )}
            >
              <TrendIcon className="size-3" />
              {trendLabel}
            </span>
          ) : null}
          {description ? <span>{description}</span> : null}
        </div>
      </CardContent>
    </Card>
  )
}
