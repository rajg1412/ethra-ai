'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

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
