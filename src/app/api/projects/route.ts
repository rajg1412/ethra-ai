import { getProjects, createProject } from '@/app/(dashboard)/projects/actions'
import { createProjectSchema } from '@/lib/schemas'
import { jsonError, parseJsonBody, requireApiAuth, toFormData } from '../_utils'

export async function GET() {
  const auth = await requireApiAuth()
  if ('error' in auth) return auth.error

  try {
    const data = await getProjects()
    return Response.json({ data })
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Server error', 500)
  }
}

export async function POST(request: Request) {
  const auth = await requireApiAuth()
  if ('error' in auth) return auth.error

  const parsed = await parseJsonBody(request, createProjectSchema)
  if ('error' in parsed) return parsed.error

  try {
    const created = await createProject(
      toFormData({
        name: parsed.data.name,
        description: parsed.data.description,
      })
    )

    return Response.json({ data: created }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    const status =
      message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500

    return jsonError(message, status)
  }
}
