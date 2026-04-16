import { CheckRow } from './CheckRow'
import type { Category, DailyLog, DailyPlan } from '@/lib/types'

const L1_BADGE: Record<string, string> = {
  basiclife: 'bg-blue-100 text-blue-700',
  body:      'bg-green-100 text-green-700',
  brain:     'bg-purple-100 text-purple-700',
}

const L1_HEADER: Record<string, string> = {
  basiclife: 'border-blue-200 bg-blue-50/60',
  body:      'border-green-200 bg-green-50/60',
  brain:     'border-purple-200 bg-purple-50/60',
}

interface CheckinBoardVerticalProps {
  date: string
  categories: Category[]
  logs: DailyLog[]
  plan: DailyPlan | null
}

export function CheckinBoardVertical({ date, categories, logs, plan }: CheckinBoardVerticalProps) {
  const logMap = new Map(logs.map(l => [l.category_id, l]))

  const l1s = categories.filter(c => c.level === 'L1')
  const l2s = categories.filter(c => c.level === 'L2')
  const l3s = categories.filter(c => c.level === 'L3')

  return (
    <div className="flex gap-3 p-4 h-full overflow-x-auto items-start">

      {/* 今日安排卡片 */}
      {plan && (() => {
        const fields = [
          { key: 'qt',       label: 'Qt'      },
          { key: 'br_new',   label: 'Br-新约' },
          { key: 'br_old',   label: 'Br-旧约' },
          { key: 'br_other', label: 'Br-其他' },
          { key: 'pr',       label: 'Pr'      },
          { key: 'sm',       label: 'SM'      },
        ] as const
        const hasContent = fields.some(f => plan[f.key])
        if (!hasContent) return null
        return (
          <div className="flex-none w-[180px] rounded-xl border border-amber-200 bg-amber-50/60 flex flex-col">
            <div className="px-3 py-2.5 border-b border-amber-200">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">今日安排</p>
            </div>
            <div className="px-3 py-2 space-y-1.5">
              {fields.map(({ key, label }) => {
                const val = plan[key]
                if (!val) return null
                return (
                  <div key={key}>
                    <p className="text-[10px] font-semibold text-amber-600 uppercase">{label}</p>
                    <p className="text-xs text-amber-900 leading-snug">{val}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* 每个 L1 一张卡片 */}
      {l1s.map(l1 => {
        const childL2s = l2s.filter(l2 => l2.parent_id === l1.id)
        const allL3    = childL2s.flatMap(l2 => l3s.filter(l3 => l3.parent_id === l2.id))
        const doneL3   = allL3.filter(l3 => (logMap.get(l3.id)?.status ?? 'none') === 'done').length
        const badgeClass  = L1_BADGE[l1.code]  ?? 'bg-muted text-muted-foreground'
        const headerClass = L1_HEADER[l1.code] ?? 'border-border bg-muted/30'

        return (
          <div key={l1.id} className="flex-none w-[220px] rounded-xl border border-border bg-card flex flex-col max-h-full">
            {/* 卡片标题 */}
            <div className={`px-3 py-2.5 border-b flex items-center justify-between rounded-t-xl ${headerClass}`}>
              <span className="text-sm font-semibold">{l1.name}</span>
              {allL3.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${badgeClass}`}>
                  {doneL3}/{allL3.length}
                </span>
              )}
            </div>

            {/* 内容列表 */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
              {childL2s.map(l2 => {
                const childL3s = l3s.filter(l3 => l3.parent_id === l2.id)
                const l2Log    = logMap.get(l2.id)

                return (
                  <div key={l2.id}>
                    {/* L2 行 */}
                    <CheckRow
                      date={date}
                      categoryId={l2.id}
                      label={l2.name}
                      status={l2Log?.status ?? 'none'}
                      notes={l2Log?.notes ?? null}
                      bold
                    />

                    {/* L3 行（缩进） */}
                    {childL3s.length > 0 && (
                      <div className="pl-5 mt-0.5 space-y-0.5">
                        {childL3s.map(l3 => {
                          const l3Log = logMap.get(l3.id)
                          return (
                            <CheckRow
                              key={l3.id}
                              date={date}
                              categoryId={l3.id}
                              label={l3.name}
                              status={l3Log?.status ?? 'none'}
                              notes={l3Log?.notes ?? null}
                            />
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
