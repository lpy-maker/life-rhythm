import { getCategories, getDailyLogs, getDailyPlan, getWeeklyTasks, getMonthlyTasks } from '@/lib/actions'
import { AppShell } from '@/components/layout/AppShell'
import { DailyPlanCard } from '@/components/today/DailyPlanCard'
import { CheckinBoard } from '@/components/today/CheckinBoard'

function todayStr() {
  return new Date().toLocaleDateString('sv-SE')
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const sp   = await searchParams
  const date = sp.date ?? todayStr()

  const [categories, logs, plan, weeklyTasks, monthlyTasks] = await Promise.all([
    getCategories(),
    getDailyLogs(date),
    getDailyPlan(date),
    getWeeklyTasks(),
    getMonthlyTasks(),
  ])

  return (
    <AppShell
      date={date}
      categories={categories}
      weeklyTasks={weeklyTasks}
      monthlyTasks={monthlyTasks}
    >
      {plan && <DailyPlanCard plan={plan} />}
      <CheckinBoard date={date} categories={categories} logs={logs} />
    </AppShell>
  )
}
