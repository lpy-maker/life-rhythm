'use client'

import { useTransition } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { setDailyLog } from '@/lib/actions'
import { LogStatus } from '@/lib/types'

interface CheckItemProps {
  date: string
  categoryId: number
  label: string
  status: LogStatus
}

// 点击顺序：none → done → none（undone 状态留给后续 UI 交互设计）
function nextStatus(current: LogStatus): LogStatus {
  return current === 'done' ? 'none' : 'done'
}

export function CheckItem({ date, categoryId, label, status }: CheckItemProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <label className={`flex items-center gap-2 cursor-pointer select-none ${isPending ? 'opacity-50' : ''}`}>
      <Checkbox
        checked={status === 'done'}
        onCheckedChange={() => {
          startTransition(() => setDailyLog(date, categoryId, nextStatus(status)))
        }}
        disabled={isPending}
      />
      <span className={`text-sm ${status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
        {label}
      </span>
    </label>
  )
}
