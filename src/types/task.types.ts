import type { ProjectListItem } from './project.types'

export type TaskStatus = 'todo' | 'in_progress' | 'completed'

export type TaskPriority = 'low' | 'medium' | 'high'

export type TaskRecord = {
  id: string
  project_id: string
  assigned_to: string | null
}

export type TaskListItem = {
  id: string
  title: string
  description: string | null
  project_id: string
  status: TaskStatus
  priority: TaskPriority
  assigned_to: string | null
  due_date: string | null
  profiles?: { full_name: string | null; avatar_url: string | null } | null
  projects?: { name: string }[] | null
}

export type TaskDetail = {
  id: string
  title: string
  description: string | null
  project_id: string
  status: TaskStatus
  priority: TaskPriority
  assigned_to: string | null
  due_date: string | null
}

export type ProjectTaskOption = ProjectListItem
