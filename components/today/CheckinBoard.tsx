import { CheckPill } from './CheckPill'
import type { Category, DailyLog } from '@/lib/types'

interface CheckinBoardProps {
  date: string
  categories: Category[]
  logs: DailyLog[]
}

// L1 色系配置
const L1_ACCENT: Record<string, string> = {
  basiclife: 'text-blue-600 bg-blue-50 border-blue-200',
  body:      'text-green-600 bg-green-50 border-green-200',
  brain:     'text-purple-600 bg-purple-50 border-purple-200',
}

const L1_SECTION_BG: Record<string, string> = {
  basiclife: 'bg-blue-50/30',
  body:      'bg-green-50/30',
  brain:     'bg-purple-50/30',
}

const L1_TITLE: Record<string, string> = {
  basiclife: 'text-blue-700',
  body:      'text-green-700',
  brain:     'text-purple-700',
}

export function CheckinBoard({ date, categories, logs }: CheckinBoardProps) {
  const logMap = new Map(logs.map(l => [l.category_id, l]))

  const l1s = categories.filter(c => c.level === 'L1')
  const l2s = categories.filter(c => c.level === 'L2')
  const l3s = categories.filter(c => c.level === 'L3')

  return (
    <div className="p-4 space-y-4">
      {l1s.map(l1 => {
        const accentClass = L1_ACCENT[l1.code] ?? 'text-foreground bg-muted border-border'
        const sectionBg   = L1_SECTION_BG[l1.code] ?? ''
        const titleClass  = L1_TITLE[l1.code] ?? 'text-foreground'
        const children = l2s.filter(l2 => l2.parent_id === l1.id)

        return (
          <section key={l1.id} className={`rounded-xl border border-border ${sectionBg} p-3`}>
            {/* L1 标题 */}
            <h2 className={`text-xs font-bold uppercase tracking-wider mb-3 ${titleClass}`}>
              {l1.name}
            </h2>

            <div className="flex flex-wrap gap-x-4 gap-y-3">
              {children.map(l2 => {
                const l2Log  = logMap.get(l2.id)
                const l3List = l3s.filter(l3 => l3.parent_id === l2.id)

                return (
                  <div key={l2.id} className="flex flex-col gap-1.5">
                    {/* L2 pill */}
                    <CheckPill
                      date={date}
                      categoryId={l2.id}
                      label={l2.name}
                      status={l2Log?.status ?? 'none'}
                      notes={l2Log?.notes ?? null}
                      variant="l2"
                      accentClass={accentClass}
                    />

                    {/* L3 pills */}
                    {l3List.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pl-1">
                        {l3List.map(l3 => {
                          const l3Log = logMap.get(l3.id)
                          return (
                            <CheckPill
                              key={l3.id}
                              date={date}
                              categoryId={l3.id}
                              label={l3.name}
                              status={l3Log?.status ?? 'none'}
                              notes={l3Log?.notes ?? null}
                              variant="l3"
                            />
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
