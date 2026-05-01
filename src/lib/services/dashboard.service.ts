import 'server-only'

import { requireAuthContext } from '@/lib/rbac'
import type { DashboardStatsResult } from '@/types/dashboard.types'

export async function getDashboardStats(): Promise<DashboardStatsResult> {
  const { supabase } = await requireAuthContext()

  const [
    { count: projectsCount },
    { count: tasksCount },
    { count: pendingCount },
    { count: overdueCount },
    { data: recentTasks },
    { data: activeProjects },
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('tasks').select('*', { count: 'exact', head: true }),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).neq('status', 'completed'),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).lt('due_date', new Date().toISOString()).neq('status', 'completed'),
    supabase.from('tasks').select('id, title, status, due_date, projects(name)').order('created_at', { ascending: false }).limit(4),
    supabase.from('projects').select('*, project_members(count)').limit(4),
  ])

  const projectIds = (activeProjects ?? []).map((project) => project.id)

  const taskRows =
    projectIds.length > 0
      ? await supabase
          .from('tasks')
          .select('project_id, status')
          .in('project_id', projectIds)
          .then(({ data }) => data ?? [])
      : []

  const projectsWithCompletion = (activeProjects ?? []).map((project) => {
    const projectTasks = taskRows.filter((task) => task.project_id === project.id)
    const total = projectTasks.length
    const completed = projectTasks.filter((task) => task.status === 'completed').length
    const completionPct = total === 0 ? 0 : Math.round((completed / total) * 100)

    return { ...project, completionPct }
  })

  return {
    stats: [
      { label: 'Active Projects', value: String(projectsCount || 0), icon: 'BarChart3' },
      { label: 'Total Tasks', value: String(tasksCount || 0), icon: 'CheckCircle2' },
      { label: 'Pending', value: String(pendingCount || 0), icon: 'Clock' },
      { label: 'Overdue', value: String(overdueCount || 0), icon: 'AlertCircle' },
    ],
    recentTasks: (recentTasks ?? []) as DashboardStatsResult['recentTasks'],
    activeProjects: projectsWithCompletion as DashboardStatsResult['activeProjects'],
  }
}
