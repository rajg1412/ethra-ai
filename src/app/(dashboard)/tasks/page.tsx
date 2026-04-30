import React from 'react'
import { Plus, Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getTasks } from './actions'
import { getProjects } from '@/app/(dashboard)/projects/actions'
import { KanbanBoard } from '@/components/KanbanBoard'
import { NewTaskModal } from '@/components/NewTaskModal'

export default async function TasksPage() {
  const [tasks, projects] = await Promise.all([getTasks(), getProjects()])

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
          <NewTaskModal projects={projects.map((p: any) => ({ id: p.id, name: p.name }))}>
            <div role="button" className="h-8 inline-flex items-center justify-center rounded-md px-3 text-xs bg-black hover:bg-slate-800 text-white gap-1.5 cursor-pointer transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Add Task
            </div>
          </NewTaskModal>
        </div>
      </div>

      <KanbanBoard
        initialTasks={tasks}
        projects={projects.map((p: any) => ({ id: p.id, name: p.name }))}
      />
    </div>
  )
}
