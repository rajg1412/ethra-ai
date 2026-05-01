'use server'

import { revalidatePath } from 'next/cache'
import {
  createProject as createProjectService,
  deleteProject as deleteProjectService,
  getManageableProjects as getManageableProjectsService,
  getProjects as getProjectsService,
} from '@/lib/services/project.service'

export async function createProject(formData: FormData) {
  const project = await createProjectService(
    Object.fromEntries(formData) as Parameters<typeof createProjectService>[0]
  )
  revalidatePath('/projects')
  revalidatePath('/dashboard')
  return project
}

export async function getProjects() {
  return getProjectsService()
}

export async function getManageableProjects() {
  return getManageableProjectsService()
}

export async function deleteProject(projectId: string) {
  const result = await deleteProjectService(projectId)
  revalidatePath('/projects')
  revalidatePath('/dashboard')
  revalidatePath('/tasks')
  revalidatePath(`/projects/${projectId}`)
  return result
}
