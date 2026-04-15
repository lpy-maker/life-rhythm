'use client'

import { useOptimistic, useTransition, useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { setWeeklyTaskLog, setMonthlyTaskLog } from '@/lib/actions'
import type { LogStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

function cycleStatus(s: LogStatus): LogStatus {
  if (s === 'none') return 'done'
  if (s === 'done') return 'undone'
  return 'none'
}

interface TaskPillProps {
  taskId: number
  period: string          // weekStart (YYYY-MM-DD) or month (YYYY-MM)
  taskType: 'weekly' | 'monthly'
  label: string
  status: LogStatus
  notes: string | null
}

export function TaskPill({ taskId, period, taskType, label, status, notes }: TaskPillProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticStatus, addOptimistic] = useOptimistic(
    status,
    (_: LogStatus, next: LogStatus) => next
  )
  const [showNotes, setShowNotes] = useState(false)
  const [notesValue, setNotesValue] = useState(notes ?? '')

  const isDone   = optimisticStatus === 'done'
  const isUndone = optimisticStatus === 'undone'

  const save = (s: LogStatus, n: string) => {
    const action = taskType === 'weekly' ? setWeeklyTaskLog : setMonthlyTaskLog
    return action(taskId, period, s, n || undefined)
  }

  function handleStatusClick() {
    const next = cycleStatus(optimisticStatus)
    startTransition(async () => {
      addOptimistic(next)
      await save(next, notesValue)
    })
  }

  function handleNotesBlur() {
    if (notesValue !== (notes ?? '')) {
      startTransition(() => save(optimisticStatus, notesValue))
    }
    setShowNotes(false)
  }

  return (
    <div className={cn('flex flex-col', isPending && 'opacity-70')}>
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium transition-all',
          isDone   && 'bg-green-50 border-green-300 text-green-700',
          isUndone && 'bg-red-50 border-red-300 text-red-600',
          !isDone && !isUndone && 'bg-background border-border text-foreground',
        )}
      >
        {/* 状态图标 */}
        <button
          onClick={handleStatusClick}
          className={cn(
            'w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors',
            isDone   && 'bg-green-500 border-green-500',
            isUndone && 'bg-red-500 border-red-500',
            !isDone && !isUndone && 'border-muted-foreground/40 hover:border-muted-foreground'
          )}
        >
          {isDone   && <span className="text-white text-[9px] leading-none">✓</span>}
          {isUndone && <span className="text-white text-[9px] leading-none">✕</span>}
        </button>

        {/* 标签 */}
        <span
          onClick={handleStatusClick}
          className={cn('cursor-pointer select-none', (isDone || isUndone) && 'line-through')}
        >
          {label}
        </span>

        {/* 备注图标 */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowNotes(v => !v) }}
          className={cn(
            'ml-0.5 transition-colors shrink-0',
            showNotes || notesValue
              ? 'text-primary'
              : 'text-muted-foreground/50 hover:text-muted-foreground'
          )}
        >
          <MessageSquare size={11} />
        </button>
      </div>

      {showNotes && (
        <textarea
          autoFocus
          value={notesValue}
          onChange={e => setNotesValue(e.target.value)}
          onBlur={handleNotesBlur}
          onKeyDown={e => { if (e.key === 'Escape') setShowNotes(false) }}
          placeholder="添加备注... (失去焦点自动保存)"
          rows={2}
          className="mt-1.5 w-full text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        />
      )}
    </div>
  )
}
