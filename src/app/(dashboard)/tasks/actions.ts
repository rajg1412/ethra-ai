'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  normalizeTaskStatus,
  requireProjectAdminContext,
  requireTaskAdminContext,
  requireTaskEditorContext,
} from '@/lib/rbac'

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
  const { supabase, projectAccess } = await requireTaskEditorContext(taskId)
  const normalizedStatus = normalizeTaskStatus(status)

  const { error } = await supabase
    .from('tasks')
    .update({ status: normalizedStatus })
    .eq('id', taskId)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
  revalidatePath('/tasks')
  revalidatePath(`/projects/${projectAccess.project.id}`)
}

export async function createTask(formData: FormData) {
  const supabase = await createClient()

  const title       = formData.get('title') as string
  const description = formData.get('description') as string
  const projectId   = formData.get('projectId') as string
  const priority    = formData.get('priority') as string
  const assignedTo  = formData.get('assignedTo') as string
  const dueDate     = formData.get('dueDate') as string

  if (!title?.trim()) throw new Error('Title is required.')
  if (!projectId?.trim()) throw new Error('Please select a project.')

  const projectAccess = await requireProjectAdminContext(projectId)
  if (!projectAccess.canManageProject) {
    throw new Error('Forbidden')
  }

  const normalizedPriority = ['low', 'medium', 'high'].includes(priority)
    ? priority
    : 'medium'

  if (assignedTo) {
    const { data: assignee, error: assigneeError } = await supabase
      .from('project_members')
      .select('user_id')
      .eq('project_id', projectId)
      .eq('user_id', assignedTo)
      .maybeSingle()

    if (assigneeError) throw new Error(assigneeError.message)
    if (!assignee) {
      throw new Error('Assigned member must belong to this project.')
    }
  }

  const { error } = await supabase.from('tasks').insert({
    title:       title.trim(),
    description: description?.trim() || null,
    project_id:  projectId,
    priority:    normalizedPriority,
    assigned_to: assignedTo || null,
    due_date:    dueDate || null,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
  revalidatePath('/tasks')
  revalidatePath(`/projects/${projectId}`)
}

export async function deleteTask(taskId: string) {
  const { supabase, projectAccess } = await requireTaskAdminContext(taskId)

  const { error } = await supabase.from('tasks').delete().eq('id', taskId)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  revalidatePath('/tasks')
  revalidatePath(`/projects/${projectAccess.project.id}`)
}
