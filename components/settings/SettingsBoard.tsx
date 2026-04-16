'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { Plus, Pencil, Trash2, Check, X, ChevronRight } from 'lucide-react'
import { addCategory, renameCategory, deleteCategory } from '@/lib/actions'
import { useAppSettings } from '@/lib/app-settings-context'
import { cn } from '@/lib/utils'
import type { Category } from '@/lib/types'

const L1_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  basiclife: { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  body:      { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  brain:     { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
}

// ── 内联编辑输入框 ──────────────────────────────────────
function InlineInput({
  defaultValue, onSave, onCancel, placeholder = '名称',
}: {
  defaultValue?: string
  onSave: (v: string) => void
  onCancel: () => void
  placeholder?: string
}) {
  const [val, setVal] = useState(defaultValue ?? '')
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => { ref.current?.focus(); ref.current?.select() }, [])

  return (
    <div className="flex items-center gap-1">
      <input
        ref={ref}
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') onSave(val.trim())
          if (e.key === 'Escape') onCancel()
        }}
        placeholder={placeholder}
        className="h-7 px-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary w-40"
      />
      <button
        onClick={() => onSave(val.trim())}
        className="p-1 rounded hover:bg-green-100 text-green-600"
      >
        <Check size={13} />
      </button>
      <button
        onClick={onCancel}
        className="p-1 rounded hover:bg-red-100 text-red-500"
      >
        <X size={13} />
      </button>
    </div>
  )
}

// ── 主组件 ──────────────────────────────────────────────
export function SettingsBoard({ categories }: { categories: Category[] }) {
  const { showSidebarToggles, setShowSidebarToggles, layout, setLayout } = useAppSettings()
  const [isPending, startTransition] = useTransition()

  const [editingId, setEditingId] = useState<number | null>(null)
  const [addingL2ForL1, setAddingL2ForL1] = useState<number | null>(null)
  const [addingL3ForL2, setAddingL3ForL2] = useState<number | null>(null)

  const l1s = categories.filter(c => c.level === 'L1')
  const l2s = categories.filter(c => c.level === 'L2')
  const l3s = categories.filter(c => c.level === 'L3')

  function openAddL2(l1Id: number) {
    setAddingL2ForL1(l1Id); setAddingL3ForL2(null); setEditingId(null)
  }
  function openAddL3(l2Id: number) {
    setAddingL3ForL2(l2Id); setAddingL2ForL1(null); setEditingId(null)
  }
  function startEdit(id: number) {
    setEditingId(id); setAddingL2ForL1(null); setAddingL3ForL2(null)
  }

  function handleRename(id: number, name: string) {
    if (!name) return setEditingId(null)
    startTransition(async () => {
      await renameCategory(id, name)
      setEditingId(null)
    })
  }

  function handleAddL2(l1Id: number, name: string) {
    if (!name) return setAddingL2ForL1(null)
    startTransition(async () => {
      await addCategory(name, 'L2', l1Id)
      setAddingL2ForL1(null)
    })
  }

  function handleAddL3(l2Id: number, name: string) {
    if (!name) return setAddingL3ForL2(null)
    startTransition(async () => {
      await addCategory(name, 'L3', l2Id)
      setAddingL3ForL2(null)
    })
  }

  function handleDelete(id: number) {
    if (!confirm('确认删除该 L3 分类？相关打卡记录不受影响。')) return
    startTransition(() => deleteCategory(id))
  }

  return (
    <div className={cn('p-5 max-w-2xl space-y-6', isPending && 'opacity-60 pointer-events-none')}>

      {/* ── 界面设置 ── */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          界面设置
        </h2>
        <div className="rounded-xl border border-border bg-card px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">侧边栏折叠箭头</p>
            <p className="text-xs text-muted-foreground mt-0.5">显示或隐藏左右侧边栏的收起/展开按钮</p>
          </div>
          <button
            onClick={() => setShowSidebarToggles(!showSidebarToggles)}
            className={cn(
              'relative w-11 h-6 rounded-full transition-colors duration-200',
              showSidebarToggles ? 'bg-primary' : 'bg-muted'
            )}
          >
            <span
              className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
                showSidebarToggles ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        {/* 布局切换 */}
        <div className="mt-3 rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-sm font-medium mb-2.5">主页布局</p>
          <div className="flex gap-2">
            {([
              { value: 'pill',     label: 'Pill 横向',  desc: 'L1 区块 + pill 式条目' },
              { value: 'vertical', label: '竖向多列',   desc: '每个 L1 一张独立卡片' },
            ] as const).map(opt => (
              <button
                key={opt.value}
                onClick={() => setLayout(opt.value)}
                className={cn(
                  'flex-1 rounded-lg border px-3 py-2.5 text-left transition-colors',
                  layout === opt.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground hover:bg-muted'
                )}
              >
                <p className="text-xs font-semibold">{opt.label}</p>
                <p className="text-[11px] mt-0.5 opacity-70">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 分类管理 ── */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          分类管理
        </h2>

        <div className="space-y-4">
          {l1s.map(l1 => {
            const colors = L1_COLORS[l1.code] ?? { bg: 'bg-muted', text: 'text-foreground', border: 'border-border' }
            const childL2s = l2s.filter(l2 => l2.parent_id === l1.id)

            return (
              <div key={l1.id} className={cn('rounded-xl border p-3', colors.border, colors.bg)}>
                {/* L1 标题 */}
                <p className={cn('text-xs font-bold uppercase tracking-wider mb-2.5', colors.text)}>
                  {l1.name}
                </p>

                <div className="space-y-2.5">
                  {childL2s.map(l2 => {
                    const childL3s = l3s.filter(l3 => l3.parent_id === l2.id)

                    return (
                      <div key={l2.id} className="bg-background rounded-lg border border-border px-3 py-2 space-y-1.5">
                        {/* L2 行 */}
                        <div className="flex items-center gap-2">
                          <ChevronRight size={12} className="text-muted-foreground shrink-0" />
                          {editingId === l2.id ? (
                            <InlineInput
                              defaultValue={l2.name}
                              onSave={name => handleRename(l2.id, name)}
                              onCancel={() => setEditingId(null)}
                            />
                          ) : (
                            <>
                              <span className="text-sm font-medium flex-1">{l2.name}</span>
                              <button
                                onClick={() => startEdit(l2.id)}
                                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
                                title="重命名"
                              >
                                <Pencil size={12} />
                              </button>
                            </>
                          )}
                        </div>

                        {/* L3 行 */}
                        <div className="pl-4 space-y-1">
                          {childL3s.map(l3 => (
                            <div key={l3.id} className="flex items-center gap-2 group">
                              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
                              {editingId === l3.id ? (
                                <InlineInput
                                  defaultValue={l3.name}
                                  onSave={name => handleRename(l3.id, name)}
                                  onCancel={() => setEditingId(null)}
                                />
                              ) : (
                                <>
                                  <span className="text-sm flex-1 text-muted-foreground">{l3.name}</span>
                                  <button
                                    onClick={() => startEdit(l3.id)}
                                    className="p-1 rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-muted"
                                    title="重命名"
                                  >
                                    <Pencil size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(l3.id)}
                                    className="p-1 rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50"
                                    title="删除"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </>
                              )}
                            </div>
                          ))}

                          {/* 新增 L3 表单 */}
                          {addingL3ForL2 === l2.id ? (
                            <div className="mt-1">
                              <InlineInput
                                placeholder="新增 L3 名称"
                                onSave={name => handleAddL3(l2.id, name)}
                                onCancel={() => setAddingL3ForL2(null)}
                              />
                            </div>
                          ) : (
                            <button
                              onClick={() => openAddL3(l2.id)}
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-0.5"
                            >
                              <Plus size={11} /> 新增 L3
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* 新增 L2 表单 */}
                <div className="mt-2.5 pl-1">
                  {addingL2ForL1 === l1.id ? (
                    <InlineInput
                      placeholder="新增 L2 名称"
                      onSave={name => handleAddL2(l1.id, name)}
                      onCancel={() => setAddingL2ForL1(null)}
                    />
                  ) : (
                    <button
                      onClick={() => openAddL2(l1.id)}
                      className={cn('flex items-center gap-1 text-xs font-medium hover:opacity-80', colors.text)}
                    >
                      <Plus size={11} /> 新增 L2
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
