'use server'

import { revalidatePath } from 'next/cache'
import {
  createTask as createTaskService,
  deleteTask as deleteTaskService,
  getTasks as getTasksService,
  updateTask as updateTaskService,
  updateTaskStatus as updateTaskStatusService,
} from '@/lib/services/task.service'

export async function getTasks(projectId?: string) {
  return getTasksService(projectId)
}

export async function updateTaskStatus(taskId: string, status: string) {
  const result = await updateTaskStatusService(taskId, status)
  revalidatePath('/dashboard')
  revalidatePath('/tasks')
  revalidatePath(`/projects/${result.project_id}`)
  return result
}

export async function createTask(formData: FormData) {
  const result = await createTaskService(
    Object.fromEntries(formData) as Parameters<typeof createTaskService>[0]
  )
  revalidatePath('/dashboard')
  revalidatePath('/tasks')
  revalidatePath(`/projects/${result.project_id}`)
  return result
}

export async function updateTask(taskId: string, formData: FormData) {
  const result = await updateTaskService(taskId, Object.fromEntries(formData))
  revalidatePath('/dashboard')
  revalidatePath('/tasks')
  revalidatePath(`/projects/${result.project_id}`)
  return result
}

export async function deleteTask(taskId: string) {
  const result = await deleteTaskService(taskId)
  revalidatePath('/dashboard')
  revalidatePath('/tasks')
  revalidatePath(`/projects/${result.projectId}`)
  return result
}
