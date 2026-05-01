import type { TaskStatus } from './task.types'

export type DashboardStat = {
  label: string
  value: string
  icon: 'BarChart3' | 'CheckCircle2' | 'Clock' | 'AlertCircle'
}

export type DashboardTask = {
  id: string
  title: string
  status: TaskStatus
  due_date: string | null
  projects: { name: string }[] | null
}

export type DashboardProject = {
  id: string
  name: string
  project_members: { count: number }[]
  completionPct: number
}

export type DashboardStatsResult = {
  stats: DashboardStat[]
  recentTasks: DashboardTask[]
  activeProjects: DashboardProject[]
}
