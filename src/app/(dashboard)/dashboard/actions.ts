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
    { data: activeProjects }
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('tasks').select('*', { count: 'exact', head: true }),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).neq('status', 'completed'),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).lt('due_date', new Date().toISOString()).neq('status', 'completed'),
    supabase.from('tasks').select('*, projects(name)').order('created_at', { ascending: false }).limit(4),
    supabase.from('projects').select('*, project_members(count)').limit(4)
  ])

  return {
    stats: [
      { label: 'Active Projects', value: String(projectsCount || 0), icon: 'BarChart3' },
      { label: 'Total Tasks', value: String(tasksCount || 0), icon: 'CheckCircle2' },
      { label: 'Pending', value: String(pendingCount || 0), icon: 'Clock' },
      { label: 'Overdue', value: String(overdueCount || 0), icon: 'AlertCircle' },
    ],
    recentTasks: recentTasks || [],
    activeProjects: activeProjects || []
  }
}
