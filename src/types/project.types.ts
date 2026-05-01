export type ProjectRole = 'admin' | 'member'

export type ProjectSummary = {
  id: string
  name: string
  description: string | null
  created_at: string
  owner_id: string | null
  project_members: { count: number }[]
}

export type ProjectListItem = {
  id: string
  name: string
}

export type ProjectDetail = {
  id: string
  name: string
  description: string | null
  created_at: string
  owner_id: string | null
}

export type ProjectAccess = {
  project: ProjectDetail
  membershipRole: ProjectRole | null
  isOwner: boolean
  canViewProject: boolean
  canManageProject: boolean
}

export type ManageableProject = ProjectListItem
