'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LeftSidebar } from './LeftSidebar'
import { RightPanel } from './RightPanel'
import { TopBar } from './TopBar'
import type { Category, WeeklyTaskDef, MonthlyTaskDef } from '@/lib/types'

interface AppShellProps {
  date: string
  categories: Category[]
  weeklyTasks: WeeklyTaskDef[]
  monthlyTasks: MonthlyTaskDef[]
  children: React.ReactNode
}

export function AppShell({ date, categories, weeklyTasks, monthlyTasks, children }: AppShellProps) {
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">

      {/* 左侧边栏 */}
      <div className={cn('shrink-0 h-full relative transition-[width] duration-200', leftOpen ? 'w-[220px]' : 'w-0 overflow-hidden')}>
        <LeftSidebar categories={categories} />
      </div>

      {/* 左侧收起/展开按钮 */}
      <button
        onClick={() => setLeftOpen(v => !v)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-5 h-10 flex items-center justify-center bg-background border border-border rounded-r-md hover:bg-muted transition-all duration-200 text-muted-foreground hover:text-foreground"
        style={{ left: leftOpen ? '220px' : '0px' }}
        title={leftOpen ? '收起左侧' : '展开左侧'}
      >
        {leftOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>

      {/* 主内容区 */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <TopBar date={date} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* 右侧收起/展开按钮 */}
      <button
        onClick={() => setRightOpen(v => !v)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-5 h-10 flex items-center justify-center bg-background border border-border rounded-l-md hover:bg-muted transition-all duration-200 text-muted-foreground hover:text-foreground"
        style={{ right: rightOpen ? '280px' : '0px' }}
        title={rightOpen ? '收起右侧' : '展开右侧'}
      >
        {rightOpen ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* 右侧面板 */}
      <div className={cn('shrink-0 h-full transition-[width] duration-200', rightOpen ? 'w-[280px]' : 'w-0 overflow-hidden')}>
        <RightPanel date={date} weeklyTasks={weeklyTasks} monthlyTasks={monthlyTasks} />
      </div>

    </div>
  )
}
