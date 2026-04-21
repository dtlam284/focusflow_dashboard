import React from 'react'
import { ChevronRight, Home } from 'lucide-react'

import { cn } from '@/utils'
import { useI18n } from '@/contexts/I18nContext'

export interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: { label: string; href?: string }[]
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
  className,
}: PageHeaderProps) {
  const { t } = useI18n()

  return (
    <header
      className={cn(
        'mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between',
        className,
      )}
    >
      <div className="min-w-0 space-y-2">
        {breadcrumbs.length > 0 ? (
          <nav
            aria-label={t('Breadcrumb')}
            className="flex flex-wrap items-center text-xs font-medium text-slate-500 dark:text-slate-400"
          >
            <a
              href="/"
              className="flex items-center gap-1 transition-colors hover:text-slate-900 dark:hover:text-slate-200"
              aria-label={t('Dashboard')}
              title={t('Dashboard')}
            >
              <Home className="h-3.5 w-3.5" />
            </a>

            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={`${crumb.label}-${crumb.href ?? index}`}>
                <ChevronRight className="mx-1 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="transition-colors hover:text-slate-900 dark:hover:text-slate-200"
                  >
                    {t(crumb.label)}
                  </a>
                ) : (
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {t(crumb.label)}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        ) : null}

        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {t(title)}
          </h1>

          {description ? (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t(description)}</p>
          ) : null}
        </div>
      </div>

      {actions ? (
        <div className="flex items-center gap-2 self-start md:self-auto [&_[data-slot='button']]:h-8 [&_[data-slot='button']]:px-3">
          {actions}
        </div>
      ) : null}
    </header>
  )
}
