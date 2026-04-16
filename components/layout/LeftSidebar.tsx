'use client'

import { CheckSquare, Settings, Search } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Category } from '@/lib/types'

interface LeftSidebarProps {
  categories: Category[]
}

export function LeftSidebar({ categories }: LeftSidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()

  const l1s = categories.filter(c => c.level === 'L1')
  const l2s = categories.filter(c => c.level === 'L2')

  const isHome     = pathname === '/'
  const isSettings = pathname === '/settings'

  return (
    <aside className="w-full h-full flex flex-col bg-sidebar border-r border-border">
      {/* 标题 */}
      <div className="px-4 py-4 border-b border-border shrink-0">
        <span className="text-base font-semibold">生活记录</span>
      </div>

      {/* 搜索框 */}
      <div className="px-3 py-2.5 shrink-0">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            placeholder="搜索"
            className="w-full pl-8 pr-2 h-8 text-sm bg-muted/50 rounded-md border-0 outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* 导航 */}
      <nav className="px-2 py-1 shrink-0 space-y-0.5">
        <button
          onClick={() => router.push('/')}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left',
            isHome
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <CheckSquare size={16} />
          Day Review
        </button>
      </nav>

      {/* 层级分类 */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
          层级
        </p>
        {l1s.map(l1 => {
          const children = l2s.filter(l2 => l2.parent_id === l1.id)
          return (
            <div key={l1.id} className="mb-3">
              <p className="text-xs text-muted-foreground font-medium px-3 py-1">{l1.name}</p>
              {children.map(l2 => (
                <button
                  key={l2.id}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors text-left text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <span className="w-2 h-2 rounded-full shrink-0 bg-current opacity-40" />
                  <span className="text-xs">{l2.name}</span>
                </button>
              ))}
            </div>
          )
        })}
      </div>

      {/* 设置 */}
      <div className="px-2 py-2 border-t border-border shrink-0">
        <button
          onClick={() => router.push('/settings')}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left',
            isSettings
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Settings size={16} />
          设置
        </button>
      </div>
    </aside>
  )
}
