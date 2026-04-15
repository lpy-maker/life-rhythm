import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import {
  getCategories, getDailyLogs, getDailyPlan,
  getWeeklyTasks, getMonthlyTasks,
  getWeeklyTaskLogs, getMonthlyTaskLogs,
} from '@/lib/actions'
import { AppShell } from '@/components/layout/AppShell'
import { DailyPlanCard } from '@/components/today/DailyPlanCard'
import { CheckinBoard } from '@/components/today/CheckinBoard'

dayjs.extend(weekOfYear)

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

  const weekStart = dayjs(date).startOf('week').format('YYYY-MM-DD')
  const month     = dayjs(date).format('YYYY-MM')

  const [categories, logs, plan, weeklyTasks, monthlyTasks, weeklyLogs, monthlyLogs] =
    await Promise.all([
      getCategories(),
      getDailyLogs(date),
      getDailyPlan(date),
      getWeeklyTasks(),
      getMonthlyTasks(),
      getWeeklyTaskLogs(weekStart),
      getMonthlyTaskLogs(month),
    ])

  return (
    <AppShell
      date={date}
      weekStart={weekStart}
      month={month}
      categories={categories}
      weeklyTasks={weeklyTasks}
      monthlyTasks={monthlyTasks}
      weeklyLogs={weeklyLogs}
      monthlyLogs={monthlyLogs}
    >
      {plan && <DailyPlanCard plan={plan} />}
      <CheckinBoard date={date} categories={categories} logs={logs} />
    </AppShell>
  )
}
