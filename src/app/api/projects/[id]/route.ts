import { jsonError } from '../../_utils'
import { z } from 'zod'
import { deleteProject, getProjectDetails } from '@/lib/services/project.service'

type Params = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: Params) {
  const { id } = await context.params
  const idCheck = z.string().uuid().safeParse(id)
  if (!idCheck.success) return jsonError('Invalid project id.', 400)

  try {
    const { projectAccess, memberCount } = await getProjectDetails(id)
    if (!projectAccess.canViewProject) {
      return jsonError('Forbidden', 403)
    }

    return Response.json({
      data: {
        ...projectAccess.project,
        project_members: [{ count: memberCount }],
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    const status = message === 'Project not found.' ? 404 : message === 'Forbidden' ? 403 : 500
    return jsonError(message, status)
  }
}

export async function DELETE(_request: Request, context: Params) {
  const { id } = await context.params
  const idCheck = z.string().uuid().safeParse(id)
  if (!idCheck.success) return jsonError('Invalid project id.', 400)

  try {
    const result = await deleteProject(id)
    return Response.json({ data: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    const status = message === 'Project not found.' ? 404 : message === 'Forbidden' ? 403 : 500
    return jsonError(message, status)
  }
}
