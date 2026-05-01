import React from 'react'
import { Plus, Folder, Users, Calendar, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { NewProjectModal } from '@/components/NewProjectModal'
import { getProjects } from './actions'

type ProjectWithMembers = {
  id: string
  name: string
  description: string | null
  created_at: string
  owner_id: string | null
  project_members: { count: number }[]
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black tracking-tight">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">All your team workspaces in one place.</p>
        </div>
        <NewProjectModal>
          <button className="inline-flex items-center justify-center bg-black hover:bg-slate-800 text-white text-sm font-medium h-9 px-4 rounded-md gap-2 cursor-pointer transition-colors">
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </NewProjectModal>
      </div>

      {projects.length === 0 ? (
        <div className="border border-dashed border-slate-200 rounded-xl p-16 text-center">
          <Folder className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No projects yet.</p>
          <NewProjectModal>
            <button className="mt-4 inline-flex items-center justify-center bg-black hover:bg-slate-800 text-white text-sm font-medium h-9 px-4 rounded-md cursor-pointer transition-colors">
              Create your first project
            </button>
          </NewProjectModal>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project: ProjectWithMembers) => (
            <Card
              key={project.id}
              className="bg-white border-slate-200 hover:border-black transition-colors group shadow-none"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 group-hover:bg-black group-hover:text-white transition-colors">
                    <Folder className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="text-xs border-slate-200 text-slate-500">
                    Active
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold text-black mt-3 group-hover:text-black leading-snug">
                  {project.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                  {project.description || 'No description.'}
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{project.project_members?.length ?? 0} members</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href={`/projects/${project.id}`} className="w-full">
                  <Button
                    variant="outline"
                    className="w-full border-slate-200 text-slate-600 hover:bg-black hover:text-white hover:border-black text-sm transition-all"
                  >
                    Open <ArrowRight className="w-3.5 h-3.5 ml-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
