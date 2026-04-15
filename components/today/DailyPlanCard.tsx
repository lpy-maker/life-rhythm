import type { DailyPlan } from '@/lib/types'

const FIELDS: { key: keyof DailyPlan; label: string }[] = [
  { key: 'qt',       label: 'Qt'      },
  { key: 'br_new',   label: 'Br-新约' },
  { key: 'br_old',   label: 'Br-旧约' },
  { key: 'br_other', label: 'Br-其他' },
  { key: 'pr',       label: 'Pr'      },
  { key: 'sm',       label: 'SM'      },
]

export function DailyPlanCard({ plan }: { plan: DailyPlan }) {
  const hasContent = FIELDS.some(f => plan[f.key])
  if (!hasContent) return null

  return (
    <div className="mx-4 mt-3 mb-1 rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2.5">
      <p className="text-xs font-semibold text-amber-700 mb-2 uppercase tracking-wide">今日计划内容</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {FIELDS.map(({ key, label }) => {
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
  )
}
