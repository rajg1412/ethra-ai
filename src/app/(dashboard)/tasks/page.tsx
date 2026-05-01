import React from 'react'
import { Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { getAuthContext } from '@/lib/rbac'
import { KanbanBoard } from '@/components/KanbanBoard'
import { NewTaskModal } from '@/components/NewTaskModal'
import { getTasks } from '@/lib/services/task.service'
import { getManageableProjects } from '@/lib/services/project.service'

export default async function TasksPage() {
  const { user, isAdmin } = await getAuthContext()
  const [tasks, manageableProjects] = await Promise.all([
    getTasks(),
    getManageableProjects(),
  ])

  const projectOptions = manageableProjects.map((project) => ({
    id: project.id,
    name: project.name,
  }))
  const manageableProjectIds = projectOptions.map((project) => project.id)
  const canCreateTask = isAdmin || manageableProjectIds.length > 0

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black tracking-tight">Task Board</h1>
          <p className="text-sm text-slate-500 mt-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''} across all projects.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              placeholder="Search tasks…"
              className="h-8 pl-9 text-sm bg-white border-slate-200 text-black placeholder:text-slate-400 focus-visible:ring-black w-44"
            />
          </div>
          {canCreateTask && projectOptions.length > 0 && (
            <NewTaskModal projects={projectOptions}>
              <button className="h-8 inline-flex items-center justify-center rounded-md px-3 text-xs bg-black hover:bg-slate-800 text-white gap-1.5 cursor-pointer transition-colors">
                <Plus className="w-3.5 h-3.5" />
                Add Task
              </button>
            </NewTaskModal>
          )}
        </div>
      </div>

      <KanbanBoard
        currentUserId={user.id}
        initialTasks={tasks}
        projects={projectOptions}
        manageableProjectIds={manageableProjectIds}
        canCreateTask={canCreateTask}
      />
    </div>
  )
}
