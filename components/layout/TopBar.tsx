'use client'

import { ChevronLeft, ChevronRight, Sun } from 'lucide-react'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { cn } from '@/lib/utils'

dayjs.locale('zh-cn')

function getWeekDays(date: string): dayjs.Dayjs[] {
  const d = dayjs(date)
  const sunday = d.subtract(d.day(), 'day')
  return Array.from({ length: 7 }, (_, i) => sunday.add(i, 'day'))
}

export function TopBar({ date }: { date: string }) {
  const router = useRouter()
  const today = dayjs().format('YYYY-MM-DD')
  const weekDays = getWeekDays(date)

  function go(d: string) {
    router.push(`/?date=${d}`)
  }

  return (
    <div className="h-[60px] flex items-center gap-1 px-3 border-b border-border bg-background shrink-0">
      <button
        onClick={() => go(dayjs(date).subtract(7, 'day').format('YYYY-MM-DD'))}
        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="flex items-center gap-0.5 flex-1">
        {weekDays.map((d) => {
          const ds = d.format('YYYY-MM-DD')
          const isToday = ds === today
          const isSelected = ds === date
          return (
            <button
              key={ds}
              onClick={() => go(ds)}
              className={cn(
                'flex flex-col items-center justify-center h-11 px-2 rounded-md transition-colors flex-1',
                isSelected
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : isToday
                  ? 'text-primary font-medium hover:bg-muted'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <span className="leading-none text-xs">{d.format('ddd')}</span>
              <span className="leading-none mt-1 font-semibold text-base">{d.format('D')}</span>
            </button>
          )
        })}
      </div>

      <button
        onClick={() => go(dayjs(date).add(7, 'day').format('YYYY-MM-DD'))}
        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronRight size={16} />
      </button>

      <button
        onClick={() => go(today)}
        className={cn(
          'p-1.5 rounded transition-colors ml-1',
          date === today ? 'text-amber-500' : 'text-muted-foreground hover:text-amber-500 hover:bg-muted'
        )}
        title="回到今天"
      >
        <Sun size={16} />
      </button>
    </div>
  )
}
