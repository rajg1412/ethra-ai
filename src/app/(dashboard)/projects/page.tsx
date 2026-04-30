'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Folder, Users, Calendar, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const projects = [
  { id: '1', name: 'Website Redesign', description: 'Complete overhaul of the company landing page and blog.', members: 5, tasks: 12, deadline: 'May 12, 2026', status: 'In Progress' },
  { id: '2', name: 'Mobile App', description: 'Developing a cross-platform mobile application for clients.', members: 8, tasks: 24, deadline: 'Jun 20, 2026', status: 'Active' },
  { id: '3', name: 'Backend API', description: 'Scalable microservices for data processing and storage.', members: 4, tasks: 8, deadline: 'May 30, 2026', status: 'Planning' },
  { id: '4', name: 'Marketing Portal', description: 'Internal tool for managing marketing assets and campaigns.', members: 3, tasks: 5, deadline: 'Apr 15, 2026', status: 'Completed' },
]

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Projects</h1>
          <p className="text-slate-400 mt-1">Manage and track all your active projects.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 px-6 shadow-lg shadow-indigo-500/20">
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm group hover:border-indigo-500/50 transition-all duration-300 h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
                    <Folder className="w-6 h-6" />
                  </div>
                  <Badge variant="outline" className="bg-slate-950 border-slate-800 text-slate-400">
                    {project.status}
                  </Badge>
                </div>
                <CardTitle className="text-xl text-white mt-4 group-hover:text-indigo-400 transition-colors">
                  {project.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">
                  {project.description}
                </p>
                <div className="flex items-center gap-6 mt-6">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{project.members} members</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{project.deadline}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-6 px-6">
                <Link href={`/projects/${project.id}`} className="w-full">
                  <Button variant="outline" className="w-full border-slate-800 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300">
                    View Project <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
