import type { ProjectRole } from './project.types'

export type TeamMemberRow = {
  id: string
  user_id: string
  role: ProjectRole
  project_id: string
  profiles: { full_name: string | null; email: string | null } | null
  projects: { name: string | null; owner_id: string | null } | null
}

export type InviteMemberInput = {
  email: string
  projectId: string
  role: ProjectRole
}

export type UpdateMemberRoleInput = {
  projectId: string
  role: ProjectRole
}

export type RemoveMemberInput = {
  projectId: string
}
