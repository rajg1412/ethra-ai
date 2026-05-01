'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  normalizeTaskStatus,
  requireAuthContext,
  requireProjectAdminContext,
  requireTaskAdminContext,
  requireTaskEditorContext,
} from '@/lib/rbac'
import {
  createTaskSchema,
  getSchemaErrorMessage,
  normalizeSchemaInput,
} from '@/lib/schemas'

export async function getTasks(projectId?: string) {
  const { supabase } = await requireAuthContext()

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

  const result = createTaskSchema.safeParse(
    normalizeSchemaInput(Object.fromEntries(formData))
  )

  if (!result.success) {
    throw new Error(getSchemaErrorMessage(result.error))
  }

  const projectAccess = await requireProjectAdminContext(result.data.projectId)
  if (!projectAccess.canManageProject) {
    throw new Error('Forbidden')
  }

  if (result.data.assignedTo) {
    const { data: assignee, error: assigneeError } = await supabase
      .from('project_members')
      .select('user_id')
      .eq('project_id', result.data.projectId)
      .eq('user_id', result.data.assignedTo)
      .maybeSingle()

    if (assigneeError) throw new Error(assigneeError.message)
    if (!assignee) {
      throw new Error('Assigned member must belong to this project.')
    }
  }

  const { error } = await supabase.from('tasks').insert({
    title: result.data.title.trim(),
    description: result.data.description?.trim() || null,
    project_id: result.data.projectId,
    priority: result.data.priority,
    assigned_to: result.data.assignedTo || null,
    due_date: result.data.dueDate || null,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
  revalidatePath('/tasks')
  revalidatePath(`/projects/${result.data.projectId}`)
}

export async function deleteTask(taskId: string) {
  const { supabase, projectAccess } = await requireTaskAdminContext(taskId)

  const { error } = await supabase.from('tasks').delete().eq('id', taskId)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  revalidatePath('/tasks')
  revalidatePath(`/projects/${projectAccess.project.id}`)
}
