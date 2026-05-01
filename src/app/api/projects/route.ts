import { createProject, getProjects } from '@/lib/services/project.service'
import { createProjectSchema } from '@/lib/schemas'
import { jsonError, parseJsonBody } from '../_utils'

export async function GET() {
  try {
    const data = await getProjects()
    return Response.json({ data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    const status =
      message === 'Unauthorized'
        ? 401
        : message === 'Forbidden'
          ? 403
          : 500

    return jsonError(message, status)
  }
}

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, createProjectSchema)
  if ('error' in parsed) return parsed.error

  try {
    const created = await createProject(parsed.data)

    return Response.json({ data: created }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    const status =
      message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500

    return jsonError(message, status)
  }
}
