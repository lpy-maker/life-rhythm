'use client'

import { useTransition } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { toggleDailyLog } from '@/lib/actions'

interface CheckItemProps {
  date: string
  categoryId: number
  label: string
  done: boolean
}

export function CheckItem({ date, categoryId, label, done }: CheckItemProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <label className={`flex items-center gap-2 cursor-pointer select-none ${isPending ? 'opacity-50' : ''}`}>
      <Checkbox
        checked={done}
        onCheckedChange={() => {
          startTransition(() => toggleDailyLog(date, categoryId, done))
        }}
        disabled={isPending}
      />
      <span className={`text-sm ${done ? 'line-through text-muted-foreground' : ''}`}>
        {label}
      </span>
    </label>
  )
}
