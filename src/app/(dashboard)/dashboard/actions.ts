'use server'

import { createClient } from '@/utils/supabase/server'

export async function getDashboardStats() {
  const supabase = await createClient()

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
    supabase.from('tasks').select('*, projects(name)').order('created_at', { ascending: false }).limit(4),
    supabase.from('projects').select('*, project_members(count)').limit(4),
  ])

  const projectsWithCompletion = await Promise.all(
    (activeProjects || []).map(async (project) => {
      const [completedResult, totalResult] = await Promise.all([
        supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', project.id)
          .eq('status', 'completed'),
        supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', project.id),
      ])

      const completedCount = completedResult.count ?? 0
      const totalCount = totalResult.count ?? 0
      const completionPct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)

      return {
        ...project,
        completionPct,
      }
    })
  )

  return {
    stats: [
      { label: 'Active Projects', value: String(projectsCount || 0), icon: 'BarChart3' },
      { label: 'Total Tasks', value: String(tasksCount || 0), icon: 'CheckCircle2' },
      { label: 'Pending', value: String(pendingCount || 0), icon: 'Clock' },
      { label: 'Overdue', value: String(overdueCount || 0), icon: 'AlertCircle' },
    ],
    recentTasks: recentTasks || [],
    activeProjects: projectsWithCompletion,
  }
}
