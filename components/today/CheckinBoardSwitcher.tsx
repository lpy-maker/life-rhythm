'use client'

import { useAppSettings } from '@/lib/app-settings-context'
import { CheckinBoard } from './CheckinBoard'
import { CheckinBoardVertical } from './CheckinBoardVertical'
import type { Category, DailyLog, DailyPlan } from '@/lib/types'

interface Props {
  date: string
  categories: Category[]
  logs: DailyLog[]
  plan: DailyPlan | null
}

export function CheckinBoardSwitcher({ date, categories, logs, plan }: Props) {
  const { layout } = useAppSettings()

  if (layout === 'vertical') {
    return <CheckinBoardVertical date={date} categories={categories} logs={logs} plan={plan} />
  }

  return (
    <>
      {plan && (
        <div className="mx-4 mt-3 mb-1 rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2.5">
          <p className="text-xs font-semibold text-amber-700 mb-2 uppercase tracking-wide">今日计划内容</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {(
              [
                { key: 'qt',       label: 'Qt'      },
                { key: 'br_new',   label: 'Br-新约' },
                { key: 'br_old',   label: 'Br-旧约' },
                { key: 'br_other', label: 'Br-其他' },
                { key: 'pr',       label: 'Pr'      },
                { key: 'sm',       label: 'SM'      },
              ] as const
            ).map(({ key, label }) => {
              const val = plan[key]
              if (!val) return null
              return (
                <span key={key} className="text-xs text-amber-900">
                  <span className="font-medium">{label}：</span>{val}
                </span>
              )
            })}
          </div>
        </div>
      )}
      <CheckinBoard date={date} categories={categories} logs={logs} />
    </>
  )
}
