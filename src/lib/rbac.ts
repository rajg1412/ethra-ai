import 'server-only'

import { cache } from 'react'
import { createClient } from '@/utils/supabase/server'
import type { User } from '@supabase/supabase-js'

type Profile = {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  is_admin: boolean
}

export type ProjectRole = 'admin' | 'member'
export type TaskStatus = 'todo' | 'in_progress' | 'completed'

const STATUS_MAP: Record<string, TaskStatus> = {
  todo: 'todo',
  'in-progress': 'in_progress',
  in_progress: 'in_progress',
  done: 'completed',
  completed: 'completed',
}

export type AuthContext = {
  supabase: Awaited<ReturnType<typeof createClient>>
  user: User
  profile: Profile | null
  isAdmin: boolean
}

type ProjectRecord = {
  id: string
  name: string
  description: string | null
  created_at: string
  owner_id: string | null
}

type ProjectAccess = {
  project: ProjectRecord
  membershipRole: ProjectRole | null
  isOwner: boolean
  canViewProject: boolean
  canManageProject: boolean
}

type TaskRecord = {
  id: string
  project_id: string
  assigned_to: string | null
}

export const getAuthContext = cache(async (): Promise<AuthContext> => {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Unauthorized')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, is_admin')
    .eq('id', user.id)
    .single()

  return {
    supabase,
    user,
    profile: profile ?? null,
    isAdmin: profile?.is_admin ?? false,
  }
})

export async function requireAuthContext() {
  return getAuthContext()
}

export async function requireAdminContext() {
  const context = await getAuthContext()
  if (!context.isAdmin) {
    throw new Error('Forbidden')
  }
  return context
}

async function resolveProjectAccess(
  context: AuthContext,
  projectId: string
): Promise<ProjectAccess> {
  const { supabase, user, isAdmin } = context

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, name, description, created_at, owner_id')
    .eq('id', projectId)
    .single()

  if (projectError || !project) {
    throw new Error('Project not found.')
  }

  const { data: membership } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .maybeSingle()

  const membershipRole = membership?.role as ProjectRole | undefined
  const isOwner = project.owner_id === user.id
  const canManageProject = isAdmin || isOwner || membershipRole === 'admin'

  return {
    project,
    membershipRole: membershipRole ?? null,
    isOwner,
    canViewProject: canManageProject || Boolean(membershipRole),
    canManageProject,
  }
}

async function resolveTaskAccess(
  context: AuthContext,
  taskId: string
): Promise<{
  task: TaskRecord
  projectAccess: ProjectAccess
  canUpdateTask: boolean
}> {
  const { supabase, user } = context

  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('id, project_id, assigned_to')
    .eq('id', taskId)
    .single()

  if (taskError || !task) {
    throw new Error('Task not found.')
  }

  const projectAccess = await resolveProjectAccess(context, task.project_id)
  const canUpdateTask =
    projectAccess.canManageProject || task.assigned_to === user.id

  return {
    task,
    projectAccess,
    canUpdateTask,
  }
}

export async function getProjectAccess(projectId: string) {
  const context = await getAuthContext()
  return resolveProjectAccess(context, projectId)
}

export async function requireProjectAdminContext(projectId: string) {
  const context = await getAuthContext()
  const access = await resolveProjectAccess(context, projectId)

  if (!access.canManageProject) {
    throw new Error('Forbidden')
  }

  return {
    ...context,
    ...access,
  }
}

export async function requireTaskEditorContext(taskId: string) {
  const context = await getAuthContext()
  const access = await resolveTaskAccess(context, taskId)

  if (!access.canUpdateTask) {
    throw new Error('Forbidden')
  }

  return {
    ...context,
    ...access,
  }
}

export async function requireTaskAdminContext(taskId: string) {
  const context = await getAuthContext()
  const access = await resolveTaskAccess(context, taskId)

  if (!access.projectAccess.canManageProject) {
    throw new Error('Forbidden')
  }

  return {
    ...context,
    ...access,
  }
}

export function normalizeTaskStatus(status: string): TaskStatus {
  const normalized = STATUS_MAP[status]
  if (!normalized) {
    throw new Error('Invalid task status.')
  }
  return normalized
}
