import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckItem } from '@/components/check-item'
import { getCategories, getDailyLogs, getDailyPlan } from '@/lib/actions'
import { Category, DailyLog } from '@/lib/types'

function today() {
  return new Date().toLocaleDateString('sv-SE')
}

interface L3Item { category: Category; done: boolean }
interface L2Group { category: Category; done: boolean; children: L3Item[] }
interface L1Section { category: Category; groups: L2Group[] }

function buildTree(categories: Category[], logs: DailyLog[]): L1Section[] {
  const logMap = new Map(logs.map(l => [l.category_id, l.done]))
  const l1s = categories.filter(c => c.level === 'L1')
  const l2s = categories.filter(c => c.level === 'L2')
  const l3s = categories.filter(c => c.level === 'L3')

  return l1s.map(l1 => ({
    category: l1,
    groups: l2s
      .filter(l2 => l2.parent_id === l1.id)
      .map(l2 => ({
        category: l2,
        done: logMap.get(l2.id) ?? false,
        children: l3s
          .filter(l3 => l3.parent_id === l2.id)
          .map(l3 => ({ category: l3, done: logMap.get(l3.id) ?? false })),
      })),
  }))
}

function calcProgress(groups: L2Group[]) {
  const all = groups.flatMap(g => g.children)
  if (all.length === 0) return null
  const done = all.filter(i => i.done).length
  return { done, total: all.length }
}

const L1_COLORS: Record<string, string> = {
  basiclife: 'border-blue-200 bg-blue-50/50',
  body: 'border-green-200 bg-green-50/50',
  brain: 'border-purple-200 bg-purple-50/50',
}

const L1_BADGE: Record<string, string> = {
  basiclife: 'bg-blue-100 text-blue-700',
  body: 'bg-green-100 text-green-700',
  brain: 'bg-purple-100 text-purple-700',
}

export default async function HomePage() {
  const date = today()
  const [categories, logs, plan] = await Promise.all([
    getCategories(),
    getDailyLogs(date),
    getDailyPlan(date),
  ])

  const tree = buildTree(categories, logs)

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  })

  return (
    <main className="min-h-screen bg-background p-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Life Rhythm</h1>
        <p className="text-muted-foreground text-sm mt-1">{displayDate}</p>
      </div>

      {plan && (
        <Card className="mb-4 border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-medium text-amber-800">今日计划内容</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 text-sm space-y-1 text-amber-900">
            {plan.qt && <p><span className="font-medium">Qt:</span> {plan.qt}</p>}
            {plan.br_new && <p><span className="font-medium">Br-新约:</span> {plan.br_new}</p>}
            {plan.br_old && <p><span className="font-medium">Br-旧约:</span> {plan.br_old}</p>}
            {plan.br_other && <p><span className="font-medium">Br-其他:</span> {plan.br_other}</p>}
            {plan.pr && <p><span className="font-medium">Pr:</span> {plan.pr}</p>}
            {plan.sm && <p><span className="font-medium">SM:</span> {plan.sm}</p>}
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {tree.map(section => {
          const progress = calcProgress(section.groups)
          return (
            <Card
              key={section.category.id}
              className={`border ${L1_COLORS[section.category.code] ?? ''}`}
            >
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">
                    {section.category.name}
                  </CardTitle>
                  {progress && (
                    <Badge
                      variant="secondary"
                      className={`text-xs ${L1_BADGE[section.category.code] ?? ''}`}
                    >
                      {progress.done}/{progress.total}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-4">
                {section.groups.map((group, gi) => (
                  <div key={group.category.id}>
                    {gi > 0 && <Separator className="mb-3" />}
                    <div className="mb-2">
                      <CheckItem
                        date={date}
                        categoryId={group.category.id}
                        label={group.category.name}
                        done={group.done}
                      />
                    </div>
                    {group.children.length > 0 && (
                      <div className="ml-6 space-y-2">
                        {group.children.map(item => (
                          <CheckItem
                            key={item.category.id}
                            date={date}
                            categoryId={item.category.id}
                            label={item.category.name}
                            done={item.done}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </main>
  )
}
