'use server'

import { supabase } from '@/lib/supabase'
import { Category, DailyLog, DailyPlan, LogStatus } from '@/lib/types'
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
