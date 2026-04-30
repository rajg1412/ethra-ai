'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      name,
      description,
      owner_id: user.id
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  // Add owner as admin member
  await supabase
    .from('project_members')
    .insert({
      project_id: project.id,
      user_id: user.id,
      role: 'admin'
    })

  revalidatePath('/projects')
  return project
}

export async function getProjects() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_members!inner(*)
    `)
  
  if (error) throw new Error(error.message)
  return data
}
