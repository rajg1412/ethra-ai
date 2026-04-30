'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  ArrowUpRight,
  MoreHorizontal
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NewProjectModal } from '@/components/NewProjectModal'

const stats = [
  { label: 'Active Projects', value: '12', icon: BarChart3, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { label: 'Completed Tasks', value: '128', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { label: 'Pending Tasks', value: '43', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { label: 'Overdue', value: '3', icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-400/10' },
]

const recentTasks = [
  { id: 1, title: 'Revamp Landing Page', project: 'Website Redesign', status: 'In Progress', priority: 'High', dueDate: 'Today' },
  { id: 2, title: 'Implement Auth API', project: 'Backend Services', status: 'Review', priority: 'Medium', dueDate: 'Tomorrow' },
  { id: 3, title: 'Design System Documentation', project: 'Design Ops', status: 'Completed', priority: 'Low', dueDate: 'Yesterday' },
  { id: 4, title: 'Database Migration', project: 'Infrastructure', status: 'Todo', priority: 'High', dueDate: 'May 5' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <NewProjectModal>
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 px-6 shadow-lg shadow-indigo-500/20">
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </Button>
        </NewProjectModal>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:border-slate-700 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={stat.bg + " p-3 rounded-xl"}>
                    <stat.icon className={stat.color + " w-6 h-6"} />
                  </div>
                  <Badge variant="outline" className="text-slate-500 border-slate-800">
                    +4% <ArrowUpRight className="w-3 h-3 ml-1" />
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity / Tasks */}
        <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/50 pb-6">
            <CardTitle className="text-xl text-white font-semibold">Recent Tasks</CardTitle>
            <Button variant="ghost" className="text-indigo-400 hover:text-indigo-300 hover:bg-slate-800">View All</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-800/50">
              {recentTasks.map((task) => (
                <div key={task.id} className="p-4 hover:bg-slate-800/30 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      task.priority === 'High' ? 'bg-rose-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'
                    )} />
                    <div>
                      <h4 className="text-slate-200 font-medium group-hover:text-white transition-colors">{task.title}</h4>
                      <p className="text-slate-500 text-xs mt-1">{task.project}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <Badge variant="outline" className="bg-slate-950 border-slate-800 text-slate-400 hidden sm:inline-flex">
                      {task.status}
                    </Badge>
                    <span className="text-slate-500 text-sm min-w-[80px] text-right">{task.dueDate}</span>
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Project Progress */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-800/50 pb-6">
            <CardTitle className="text-xl text-white font-semibold">Active Projects</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {[
              { name: 'Website Redesign', progress: 75, color: 'bg-indigo-500' },
              { name: 'Mobile App', progress: 40, color: 'bg-violet-500' },
              { name: 'Backend Migration', progress: 90, color: 'bg-emerald-500' },
              { name: 'Marketing Campaign', progress: 15, color: 'bg-rose-500' },
            ].map((project) => (
              <div key={project.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300 font-medium">{project.name}</span>
                  <span className="text-slate-500">{project.progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    className={`h-full ${project.color}`}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 mt-4">
              All Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
