import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import {
  getCategories,
  getWeeklyTasks, getMonthlyTasks,
  getWeeklyTaskLogs, getMonthlyTaskLogs,
} from '@/lib/actions'
import { AppShell } from '@/components/layout/AppShell'
import { SettingsBoard } from '@/components/settings/SettingsBoard'

dayjs.extend(weekOfYear)

function todayStr() {
  return new Date().toLocaleDateString('sv-SE')
}

export default async function SettingsPage() {
  const date      = todayStr()
  const weekStart = dayjs(date).startOf('week').format('YYYY-MM-DD')
  const month     = dayjs(date).format('YYYY-MM')

  const [categories, weeklyTasks, monthlyTasks, weeklyLogs, monthlyLogs] =
    await Promise.all([
      getCategories(),
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
      <SettingsBoard categories={categories} />
    </AppShell>
  )
}
