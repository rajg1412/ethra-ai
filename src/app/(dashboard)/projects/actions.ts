'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAuthContext } from '@/lib/rbac'

export async function createProject(formData: FormData) {
  const supabase = await createClient()

  // Use getUser() for server actions — session must be present via cookie
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized — please log in again.')

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!name?.trim()) throw new Error('Project name is required.')

  const { data: project, error } = await supabase
    .from('projects')
    .insert({ name: name.trim(), description: description?.trim() || null, owner_id: user.id })
    .select()
    .single()

  if (error) throw new Error(error.message)

  // Add creator as project admin member
  await supabase
    .from('project_members')
    .insert({ project_id: project.id, user_id: user.id, role: 'admin' })

  revalidatePath('/projects')
  revalidatePath('/dashboard')
  return project
}

export async function getProjects() {
  const supabase = await createClient()

  // Simple select — no !inner join to avoid RLS recursion
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

  const [ownedProjects, adminMemberships] = await Promise.all([
    supabase
      .from('projects')
      .select('id, name')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('project_members')
      .select('projects(id, name)')
      .eq('user_id', user.id)
      .eq('role', 'admin'),
  ])

  if (ownedProjects.error) throw new Error(ownedProjects.error.message)
  if (adminMemberships.error) throw new Error(adminMemberships.error.message)

  const projectsById = new Map<string, { id: string; name: string }>()

  for (const project of ownedProjects.data ?? []) {
    projectsById.set(project.id, { id: project.id, name: project.name })
  }

  for (const membership of adminMemberships.data ?? []) {
    const project = membership.projects as unknown as { id: string; name: string } | null
    if (project) {
      projectsById.set(project.id, { id: project.id, name: project.name })
    }
  }

  return Array.from(projectsById.values())
}
