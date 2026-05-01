'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAuthContext } from '@/lib/rbac'
import {
  createProjectSchema,
  getSchemaErrorMessage,
  normalizeSchemaInput,
} from '@/lib/schemas'
import type { QueryData } from '@supabase/supabase-js'

export async function createProject(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized - please log in again.')

  const result = createProjectSchema.safeParse(
    normalizeSchemaInput(Object.fromEntries(formData))
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
    .select()
    .single()

  if (error) throw new Error(error.message)

  await supabase
    .from('project_members')
    .insert({ project_id: project.id, user_id: user.id, role: 'admin' })

  revalidatePath('/projects')
  revalidatePath('/dashboard')
  return project
}

export async function getProjects() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .select('*, project_members(count)')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getManageableProjects() {
  const { supabase, user, isAdmin } = await getAuthContext()

  if (isAdmin) {
    const { data, error } = await supabase
      .from('projects')
      .select('id, name')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data ?? []
  }

  const ownedProjectsQuery = supabase
    .from('projects')
    .select('id, name')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const adminMembershipsQuery = supabase
    .from('project_members')
    .select('projects(id, name)')
    .eq('user_id', user.id)
    .eq('role', 'admin')

  type AdminMembership = QueryData<typeof adminMembershipsQuery>[number]

  const [ownedProjects, adminMemberships] = await Promise.all([
    ownedProjectsQuery,
    adminMembershipsQuery,
  ])

  if (ownedProjects.error) throw new Error(ownedProjects.error.message)
  if (adminMemberships.error) throw new Error(adminMemberships.error.message)

  const projectsById = new Map<string, { id: string; name: string }>()

  for (const project of ownedProjects.data ?? []) {
    projectsById.set(project.id, { id: project.id, name: project.name })
  }

  for (const membership of (adminMemberships.data ?? []) as AdminMembership[]) {
    const project = membership.projects?.[0]
    if (project) {
      projectsById.set(project.id, { id: project.id, name: project.name })
    }
  }

  return Array.from(projectsById.values())
}
