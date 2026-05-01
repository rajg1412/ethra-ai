import React from 'react'
import { Plus, CheckCircle2, Clock, AlertCircle, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NewProjectModal } from '@/components/NewProjectModal'
import { getDashboardStats } from './actions'
import Link from 'next/link'

const iconMap: Record<string, React.ElementType> = { BarChart3, CheckCircle2, Clock, AlertCircle }

const statusStyle: Record<string, string> = {
  todo: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-slate-900 text-white',
  completed: 'bg-black text-white',
}

type Task = {
  id: string
  title: string
  status: 'todo' | 'in_progress' | 'completed'
  due_date: string | null
  projects: { name: string } | null
}

type Project = {
  id: string
  name: string
  project_members: { count: number }[]
  completionPct: number
}

export default async function DashboardPage() {
  const { stats, recentTasks, activeProjects } = await getDashboardStats()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back. Current status below.</p>
        </div>
        <NewProjectModal>
          <button className="inline-flex items-center justify-center bg-black hover:bg-slate-800 text-white text-sm font-medium h-9 px-4 rounded-md gap-2 cursor-pointer transition-colors">
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </NewProjectModal>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = iconMap[stat.icon]
          return (
            <Card key={stat.label} className="bg-white border-slate-200 shadow-none hover:border-black transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                    {Icon && <Icon className="w-4.5 h-4.5 text-slate-600" />}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                </div>
                <p className="text-3xl font-bold text-black">{stat.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white border-slate-200 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-bold text-black">Recent Tasks</CardTitle>
            <Link href="/tasks">
              <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-black hover:bg-slate-100 h-7">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentTasks.length === 0 ? (
              <p className="text-center py-10 text-sm text-slate-400">No tasks yet.</p>
            ) : recentTasks.map((task: Task) => (
              <div
                key={task.id}
                className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate group-hover:text-black">{task.title}</p>
                  {task.projects?.name && (
                    <p className="text-xs text-slate-400 mt-0.5">{task.projects.name}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyle[task.status] ?? 'bg-slate-100 text-slate-500'}`}>
                    {task.status?.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400 min-w-16 text-right hidden sm:block">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-none">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-bold text-black">Active Projects</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {activeProjects.length === 0 ? (
              <p className="text-center py-6 text-sm text-slate-400">No projects.</p>
            ) : activeProjects.map((project: Project) => (
              <div key={project.id} className="space-y-1.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-700 truncate">{project.name}</span>
                  <span className="text-slate-400 text-xs ml-2">{project.completionPct}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-black rounded-full" style={{ width: `${project.completionPct}%` }} />
                </div>
              </div>
            ))}
            <Link href="/projects">
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 border-slate-200 text-slate-600 hover:bg-black hover:text-white hover:border-black text-xs transition-all"
              >
                All Projects
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
