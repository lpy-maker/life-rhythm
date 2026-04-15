// Types derived from the categories table structure
export interface Category {
  id: number
  code: string
  name: string
  level: 'L1' | 'L2' | 'L3'
  parent_id: number | null
  sort_order: number
}

export type LogStatus = 'done' | 'undone' | 'none'

export interface DailyLog {
  id: number
  date: string
  category_id: number
  status: LogStatus
  notes: string | null
}

export interface DailyPlan {
  id: number
  date: string
  qt: string | null
  br_new: string | null
  br_old: string | null
  br_other: string | null
  pr: string | null
  sm: string | null
}

export interface WeeklyTaskDef {
  id: number
  name: string
  active: boolean
  sort_order: number
}

export interface WeeklyTaskLog {
  id: number
  task_id: number
  week_start: string
  done: boolean
  notes: string | null
}

export interface MonthlyTaskDef {
  id: number
  name: string
  active: boolean
  sort_order: number
}

export interface MonthlyTaskLog {
  id: number
  task_id: number
  month: string
  done: boolean
  notes: string | null
}
