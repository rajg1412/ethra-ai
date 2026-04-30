'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTasks(projectId?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('tasks')
    .select('*, profiles(full_name, avatar_url), projects(name)')
    .order('created_at', { ascending: false })

  if (projectId) query = query.eq('project_id', projectId)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function updateTaskStatus(taskId: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').update({ status }).eq('id', taskId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
  revalidatePath('/tasks')
}

export async function createTask(formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const title       = formData.get('title') as string
  const description = formData.get('description') as string
  const projectId   = formData.get('projectId') as string
  const priority    = formData.get('priority') as string
  const assignedTo  = formData.get('assignedTo') as string
  const dueDate     = formData.get('dueDate') as string

  if (!title?.trim()) throw new Error('Title is required.')

  const { error } = await supabase.from('tasks').insert({
    title:       title.trim(),
    description: description?.trim() || null,
    project_id:  projectId || null,
    priority:    priority || 'medium',
    assigned_to: assignedTo || null,
    due_date:    dueDate || null,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
  revalidatePath('/tasks')
}
