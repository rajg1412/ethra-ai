import React from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { KanbanBoard } from '@/components/KanbanBoard'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Settings, 
  Calendar, 
  Folder,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getProjects } from '../actions'

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { id } = await params

  // Fetch project details
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*, project_members(count)')
    .eq('id', id)
    .single()

  if (projectError || !project) {
    return notFound()
  }

  // Fetch tasks for this project
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, profiles(full_name, avatar_url)')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  // Fetch all projects for the NewTaskModal inside KanbanBoard
  const allProjects = await getProjects()

  return (
    <div className="space-y-8">
      {/* Header */}
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
              <h1 className="text-3xl font-bold text-black tracking-tight">{project.name}</h1>
              <p className="text-slate-500 mt-1 max-w-2xl">{project.description || 'No description provided.'}</p>
              
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Users className="w-4 h-4" />
                  <span>{project.project_members?.[0]?.count || 0} Members</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                </div>
                <Badge variant="outline" className="text-[10px] font-bold border-slate-200 text-slate-500 uppercase">
                  Active
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50 gap-2">
              <Users className="w-4 h-4" />
              Manage Team
            </Button>
            <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50 gap-2">
              <Settings className="w-4 h-4" />
              Project Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Task Board */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-black">Task Board</h2>
        </div>
        <KanbanBoard 
          initialTasks={tasks || []} 
          projects={allProjects.map((p: any) => ({ id: p.id, name: p.name }))}
        />
      </div>
    </div>
  )
}
