import React from 'react'
import { notFound } from 'next/navigation'
import { KanbanBoard } from '@/components/KanbanBoard'
import { Badge } from '@/components/ui/badge'
import { Users, Calendar, Folder, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getAuthContext } from '@/lib/rbac'
import { getProjectDetails } from '@/lib/services/project.service'

type ProjectDetailContentProps = {
  userId: string
  projectId: string
  projectName: string
  projectDescription: string | null
  projectCreatedAt: string
  memberCount: number
  tasks: Awaited<ReturnType<typeof getProjectDetails>>['tasks']
  canCreateTask: boolean
}

function ProjectDetailContent({
  userId,
  projectId,
  projectName,
  projectDescription,
  projectCreatedAt,
  memberCount,
  tasks,
  canCreateTask,
}: ProjectDetailContentProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <Link
          href="/projects"
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-black transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white shrink-0">
              <Folder className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black tracking-tight">{projectName}</h1>
              <p className="text-slate-500 mt-1 max-w-2xl">
                {projectDescription || 'No description provided.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Users className="w-4 h-4" />
                  <span>{memberCount || 0} Members</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>Created {new Date(projectCreatedAt).toLocaleDateString()}</span>
                </div>
                <Badge variant="outline" className="text-[10px] font-bold border-slate-200 text-slate-500 uppercase">
                  Active
                </Badge>
              </div>
            </div>
          </div>

          {canCreateTask && (
            <div className="flex items-center gap-2">
              <Link
                href="/team"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Users className="w-4 h-4" />
                Manage Team
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-black">Task Board</h2>
        </div>
        <KanbanBoard
          currentUserId={userId}
          initialTasks={tasks || []}
          projects={canCreateTask ? [{ id: projectId, name: projectName }] : []}
          manageableProjectIds={canCreateTask ? [projectId] : []}
          canCreateTask={canCreateTask}
        />
      </div>
    </div>
  )
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params

  let data:
    | {
        userId: string
        projectId: string
        projectName: string
        projectDescription: string | null
        projectCreatedAt: string
        memberCount: number
        tasks: Awaited<ReturnType<typeof getProjectDetails>>['tasks']
        canCreateTask: boolean
      }
    | undefined

  try {
    const { user } = await getAuthContext()
    const { projectAccess, memberCount, tasks } = await getProjectDetails(id)

    if (!projectAccess.canViewProject) {
      return notFound()
    }

    data = {
      userId: user?.id ?? '',
      projectId: id,
      projectName: projectAccess.project.name,
      projectDescription: projectAccess.project.description,
      projectCreatedAt: projectAccess.project.created_at,
      memberCount,
      tasks,
      canCreateTask: projectAccess.canManageProject,
    }
  } catch {
    return notFound()
  }

  if (!data) {
    return notFound()
  }

  return <ProjectDetailContent {...data} />
}
