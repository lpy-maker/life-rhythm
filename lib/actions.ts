'use server'

import { supabase } from '@/lib/supabase'
import { Category, DailyLog, DailyPlan, LogStatus, WeeklyTaskDef, MonthlyTaskDef, WeeklyTaskLog, MonthlyTaskLog } from '@/lib/types'
import { revalidatePath } from 'next/cache'

// 获取所有分类（构建 L1→L2→L3 树）
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')

  if (error) throw new Error(error.message)
  return data as Category[]
}

// 获取某天的所有打卡记录
export async function getDailyLogs(date: string): Promise<DailyLog[]> {
  const { data, error } = await supabase
    .from('daily_log')
    .select('*')
    .eq('date', date)

  if (error) throw new Error(error.message)
  return data as DailyLog[]
}

// 获取某天的内容计划
export async function getDailyPlan(date: string): Promise<DailyPlan | null> {
  const { data, error } = await supabase
    .from('daily_plan')
    .select('*')
    .eq('date', date)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data as DailyPlan | null
}

// 设置某个 category 的打卡状态和备注（L2 或 L3）
export async function setDailyLog(
  date: string,
  categoryId: number,
  status: LogStatus,
  notes?: string
): Promise<void> {
  const { error } = await supabase
    .from('daily_log')
    .upsert(
      {
        date,
        category_id: categoryId,
        status,
        notes: notes ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'date,category_id' }
    )

  if (error) throw new Error(error.message)
  revalidatePath('/')
}

// 获取活跃的周待办定义
export async function getWeeklyTasks(): Promise<WeeklyTaskDef[]> {
  const { data, error } = await supabase
    .from('weekly_task_def')
    .select('*')
    .eq('active', true)
    .order('sort_order')

  if (error) throw new Error(error.message)
  return data as WeeklyTaskDef[]
}

// 获取活跃的月待办定义
export async function getMonthlyTasks(): Promise<MonthlyTaskDef[]> {
  const { data, error } = await supabase
    .from('monthly_task_def')
    .select('*')
    .eq('active', true)
    .order('sort_order')

  if (error) throw new Error(error.message)
  return data as MonthlyTaskDef[]
}

// 获取某周的周待办记录
export async function getWeeklyTaskLogs(weekStart: string): Promise<WeeklyTaskLog[]> {
  const { data, error } = await supabase
    .from('weekly_task_log')
    .select('*')
    .eq('week_start', weekStart)

  if (error) throw new Error(error.message)
  return data as WeeklyTaskLog[]
}

// 获取某月的月待办记录
export async function getMonthlyTaskLogs(month: string): Promise<MonthlyTaskLog[]> {
  const { data, error } = await supabase
    .from('monthly_task_log')
    .select('*')
    .eq('month', month)

  if (error) throw new Error(error.message)
  return data as MonthlyTaskLog[]
}

// 设置周待办状态
export async function setWeeklyTaskLog(
  taskId: number,
  weekStart: string,
  status: LogStatus,
  notes?: string
): Promise<void> {
  const { error } = await supabase
    .from('weekly_task_log')
    .upsert(
      { task_id: taskId, week_start: weekStart, status, notes: notes ?? null },
      { onConflict: 'task_id,week_start' }
    )

  if (error) throw new Error(error.message)
  revalidatePath('/')
}

// 设置月待办状态
export async function setMonthlyTaskLog(
  taskId: number,
  month: string,
  status: LogStatus,
  notes?: string
): Promise<void> {
  const { error } = await supabase
    .from('monthly_task_log')
    .upsert(
      { task_id: taskId, month, status, notes: notes ?? null },
      { onConflict: 'task_id,month' }
    )

  if (error) throw new Error(error.message)
  revalidatePath('/')
}
