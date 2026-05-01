import 'server-only'

import {
  createProjectSchema,
  getSchemaErrorMessage,
  normalizeSchemaInput,
} from '@/lib/schemas'
import {
  getAuthContext,
  getProjectAccess,
  requireProjectAdminContext,
} from '@/lib/rbac'
import type {
  ManageableProject,
  ProjectAccess,
  ProjectDetail,
  ProjectSummary,
} from '@/types/project.types'
import type { TaskListItem } from '@/types/task.types'
import { z } from 'zod'

const projectSummarySelect =
  'id, name, description, created_at, owner_id, project_members(count)'

const projectDetailSelect = 'id, name, description, created_at, owner_id'

const manageableMembershipSelect = 'projects(id, name)'

function assertUuid(value: string, message = 'Invalid project id.') {
  const parsed = z.string().uuid().safeParse(value)
  if (!parsed.success) {
    throw new Error(message)
  }
}

export async function getProjects(): Promise<ProjectSummary[]> {
  const { supabase } = await getAuthContext()

  const { data, error } = await supabase
    .from('projects')
    .select(projectSummarySelect)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as ProjectSummary[]
}

export async function getManageableProjects(): Promise<ManageableProject[]> {
  const { supabase, user, isAdmin } = await getAuthContext()

  if (isAdmin) {
    const { data, error } = await supabase
      .from('projects')
      .select('id, name')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []) as ManageableProject[]
  }

  const ownedProjectsQuery = supabase
    .from('projects')
    .select('id, name')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const adminMembershipsQuery = supabase
    .from('project_members')
    .select(manageableMembershipSelect)
    .eq('user_id', user.id)
    .eq('role', 'admin')

  type AdminMembership = {
    projects: { id: string; name: string }[] | null
  }

  const [ownedProjects, adminMemberships] = await Promise.all([
    ownedProjectsQuery,
    adminMembershipsQuery,
  ])

  if (ownedProjects.error) throw new Error(ownedProjects.error.message)
  if (adminMemberships.error) throw new Error(adminMemberships.error.message)

  const projectsById = new Map<string, ManageableProject>()

  for (const project of (ownedProjects.data ?? []) as ManageableProject[]) {
    projectsById.set(project.id, project)
  }

  for (const membership of (adminMemberships.data ?? []) as AdminMembership[]) {
    const project = membership.projects?.[0]
    if (project) {
      projectsById.set(project.id, project)
    }
  }

  return Array.from(projectsById.values())
}

export async function createProject(input: Record<string, unknown>): Promise<ProjectDetail> {
  const { supabase, user } = await getAuthContext()
  const result = createProjectSchema.safeParse(
    normalizeSchemaInput(input)
  )

  if (!result.success) {
    throw new Error(getSchemaErrorMessage(result.error))
  }

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      name: result.data.name.trim(),
      description: result.data.description?.trim() || null,
      owner_id: user.id,
    })
    .select(projectDetailSelect)
    .single()

  if (error) throw new Error(error.message)

  const { error: membershipError } = await supabase
    .from('project_members')
    .insert({ project_id: project.id, user_id: user.id, role: 'admin' })

  if (membershipError) throw new Error(membershipError.message)

  return project as ProjectDetail
}

export async function getProjectDetails(projectId: string): Promise<{
  projectAccess: ProjectAccess
  memberCount: number
  tasks: TaskListItem[]
}> {
  assertUuid(projectId)
  const projectAccess = await getProjectAccess(projectId)

  if (!projectAccess.canViewProject) {
    throw new Error('Forbidden')
  }

  const { supabase } = await getAuthContext()

  const [{ count: memberCount }, { data: tasks, error: tasksError }] =
    await Promise.all([
      supabase
        .from('project_members')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId),
      supabase
        .from('tasks')
        .select('*, profiles(full_name, avatar_url)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false }),
    ])

  if (tasksError) throw new Error(tasksError.message)

  return {
    projectAccess,
    memberCount: memberCount ?? 0,
    tasks: (tasks ?? []) as TaskListItem[],
  }
}

export async function deleteProject(projectId: string) {
  assertUuid(projectId)
  const { supabase } = await requireProjectAdminContext(projectId)

  const { error } = await supabase.from('projects').delete().eq('id', projectId)
  if (error) throw new Error(error.message)

  return { success: true as const, projectId }
}
