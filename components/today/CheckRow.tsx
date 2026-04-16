'use client'

import { useOptimistic, useTransition, useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { setDailyLog } from '@/lib/actions'
import type { LogStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

function cycleStatus(s: LogStatus): LogStatus {
  if (s === 'none') return 'done'
  if (s === 'done') return 'undone'
  return 'none'
}

interface CheckRowProps {
  date: string
  categoryId: number
  label: string
  status: LogStatus
  notes: string | null
  bold?: boolean   // L2 行用粗体
}

export function CheckRow({ date, categoryId, label, status, notes, bold = false }: CheckRowProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticStatus, addOptimistic] = useOptimistic(
    status,
    (_: LogStatus, next: LogStatus) => next
  )
  const [showNotes, setShowNotes] = useState(false)
  const [notesValue, setNotesValue] = useState(notes ?? '')

  const isDone   = optimisticStatus === 'done'
  const isUndone = optimisticStatus === 'undone'

  function handleStatusClick() {
    const next = cycleStatus(optimisticStatus)
    startTransition(async () => {
      addOptimistic(next)
      await setDailyLog(date, categoryId, next, notesValue || undefined)
    })
  }

  function handleNotesBlur() {
    if (notesValue !== (notes ?? '')) {
      startTransition(() => setDailyLog(date, categoryId, optimisticStatus, notesValue || undefined))
    }
    setShowNotes(false)
  }

  return (
    <div className={cn('flex flex-col', isPending && 'opacity-60')}>
      <div className="flex items-center gap-2 py-0.5 group/row">
        {/* 三态 checkbox */}
        <button
          onClick={handleStatusClick}
          className={cn(
            'w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors',
            isDone   && 'bg-green-500 border-green-500',
            isUndone && 'bg-red-400 border-red-400',
            !isDone && !isUndone && 'border-muted-foreground/40 hover:border-muted-foreground'
          )}
        >
          {isDone   && <span className="text-white text-[9px] leading-none">✓</span>}
          {isUndone && <span className="text-white text-[9px] leading-none">✕</span>}
        </button>

        {/* 标签 */}
        <span
          onClick={handleStatusClick}
          className={cn(
            'flex-1 text-sm cursor-pointer select-none leading-snug',
            bold && 'font-semibold',
            (isDone || isUndone) && 'line-through text-muted-foreground'
          )}
        >
          {label}
        </span>

        {/* 备注图标 — hover 才显示 */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowNotes(v => !v) }}
          className={cn(
            'transition-colors shrink-0',
            showNotes || notesValue
              ? 'text-primary opacity-100'
              : 'text-muted-foreground/40 opacity-0 group-hover/row:opacity-100 hover:text-muted-foreground'
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
          className="mt-1 w-full text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        />
      )}
    </div>
  )
}
