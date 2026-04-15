'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { TaskPill } from '@/components/today/TaskPill'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import 'dayjs/locale/zh-cn'
import type { WeeklyTaskDef, MonthlyTaskDef, WeeklyTaskLog, MonthlyTaskLog } from '@/lib/types'

dayjs.extend(weekOfYear)
dayjs.locale('zh-cn')

const WEEK_HEADERS = ['日', '一', '二', '三', '四', '五', '六']

interface RightPanelProps {
  date: string
  weekStart: string
  month: string
  weeklyTasks: WeeklyTaskDef[]
  monthlyTasks: MonthlyTaskDef[]
  weeklyLogs: WeeklyTaskLog[]
  monthlyLogs: MonthlyTaskLog[]
}

export function RightPanel({
  date, weekStart, month,
  weeklyTasks, monthlyTasks,
  weeklyLogs, monthlyLogs,
}: RightPanelProps) {
  const router = useRouter()
  const [viewMonth, setViewMonth] = useState(() => dayjs(date).startOf('month'))
  const today = dayjs().format('YYYY-MM-DD')

  const weeklyLogMap  = new Map(weeklyLogs.map(l => [l.task_id, l]))
  const monthlyLogMap = new Map(monthlyLogs.map(l => [l.task_id, l]))

  const weekNum  = dayjs(date).week()
  const monthLabel = dayjs(date).format('MMMM')   // e.g. "April"

  const cells = useMemo(() => {
    const startDay = viewMonth.startOf('month').day()
    const arr: (dayjs.Dayjs | null)[] = []
    for (let i = 0; i < startDay; i++) arr.push(null)
    for (let d = 1; d <= viewMonth.daysInMonth(); d++) arr.push(viewMonth.date(d))
    while (arr.length % 7 !== 0) arr.push(null)
    return arr
  }, [viewMonth])

  function go(d: string) {
    router.push(`/?date=${d}`)
  }

  return (
    <aside className="w-full h-full flex flex-col border-l border-border bg-background overflow-y-auto">

      {/* 日期快速跳转 */}
      <div className="px-3 py-2 border-b border-border shrink-0">
        <input
          type="date"
          value={date}
          onChange={(e) => {
            const val = e.target.value
            if (!val) return
            const parsed = dayjs(val)
            if (parsed.isValid()) {
              go(parsed.format('YYYY-MM-DD'))
              setViewMonth(parsed.startOf('month'))
            }
          }}
          className="w-full h-8 text-sm px-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* 月份导航 */}
      <div className="flex items-center justify-between px-2 py-2 border-b border-border gap-1 shrink-0">
        <button onClick={() => setViewMonth(m => m.subtract(1, 'year'))} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="上一年">
          <ChevronsLeft size={16} />
        </button>
        <button onClick={() => setViewMonth(m => m.subtract(1, 'month'))} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="上一月">
          <ChevronLeft size={14} />
        </button>
        <button
          className="text-sm font-semibold hover:text-primary flex-1 text-center"
          onClick={() => { setViewMonth(dayjs().startOf('month')); go(today) }}
        >
          {viewMonth.format('YYYY年M月')}
        </button>
        <button onClick={() => setViewMonth(m => m.add(1, 'month'))} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="下一月">
          <ChevronRight size={14} />
        </button>
        <button onClick={() => setViewMonth(m => m.add(1, 'year'))} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="下一年">
          <ChevronsRight size={16} />
        </button>
      </div>

      {/* 星期标题 */}
      <div className="grid grid-cols-7 px-2 pt-2 shrink-0">
        {WEEK_HEADERS.map(h => (
          <div key={h} className="text-center text-xs text-muted-foreground font-medium py-1">{h}</div>
        ))}
      </div>

      {/* 日格子 */}
      <div className="grid grid-cols-7 px-2 gap-y-0.5 shrink-0">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e${idx}`} className="h-9" />
          const ds = day.format('YYYY-MM-DD')
          const isToday    = ds === today
          const isSelected = ds === date
          return (
            <button
              key={ds}
              onClick={() => {
                go(ds)
                if (day.month() !== viewMonth.month()) setViewMonth(day.startOf('month'))
              }}
              className={cn(
                'h-9 w-full rounded text-sm transition-colors flex items-center justify-center',
                isSelected ? 'bg-primary text-primary-foreground font-bold'
                  : isToday ? 'text-primary font-semibold hover:bg-muted'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              {day.date()}
            </button>
          )
        })}
      </div>

      {/* 底部日期信息 */}
      <div className="px-3 py-2 border-t border-border shrink-0">
        <p className="text-xs text-muted-foreground">{dayjs(date).format('M月D日 ddd')}</p>
      </div>

      {/* 周待办 */}
      <div className="border-t border-border px-3 py-3 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold">周待办</p>
          <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">
            Week {weekNum}
          </span>
        </div>
        {weeklyTasks.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">暂无待办事项</p>
        ) : (
          <div className="space-y-1.5">
            {weeklyTasks.map(t => {
              const log = weeklyLogMap.get(t.id)
              return (
                <TaskPill
                  key={t.id}
                  taskId={t.id}
                  period={weekStart}
                  taskType="weekly"
                  label={t.name}
                  status={log?.status ?? 'none'}
                  notes={log?.notes ?? null}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* 月待办 */}
      <div className="border-t border-border px-3 py-3 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold">月待办</p>
          <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">
            {monthLabel}
          </span>
        </div>
        {monthlyTasks.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">暂无待办事项</p>
        ) : (
          <div className="space-y-1.5">
            {monthlyTasks.map(t => {
              const log = monthlyLogMap.get(t.id)
              return (
                <TaskPill
                  key={t.id}
                  taskId={t.id}
                  period={month}
                  taskType="monthly"
                  label={t.name}
                  status={log?.status ?? 'none'}
                  notes={log?.notes ?? null}
                />
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}
