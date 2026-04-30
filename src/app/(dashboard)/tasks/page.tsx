'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  MoreHorizontal, 
  Calendar, 
  User as UserIcon,
  Filter,
  Search,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { updateTaskStatus } from './actions'

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-500' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-indigo-500' },
  { id: 'completed', title: 'Completed', color: 'bg-emerald-500' },
]

const initialTasks = [
  { id: '1', title: 'Design System Update', description: 'Update the color palette and typography in the Figma file.', status: 'todo', priority: 'High', assignee: { name: 'Sarah', avatar: '' }, dueDate: 'May 5' },
  { id: '2', title: 'API Integration', description: 'Connect the frontend with the new Supabase edge functions.', status: 'in_progress', priority: 'Medium', assignee: { name: 'Alex', avatar: '' }, dueDate: 'May 2' },
  { id: '3', title: 'User Research', description: 'Conduct interviews with at least 5 potential customers.', status: 'in_progress', priority: 'High', assignee: { name: 'John', avatar: '' }, dueDate: 'May 3' },
  { id: '4', title: 'Security Audit', description: 'Review all RLS policies and auth flow for vulnerabilities.', status: 'todo', priority: 'Critical', assignee: { name: 'Admin', avatar: '' }, dueDate: 'May 10' },
  { id: '5', title: 'Bug Fix: Layout shift', description: 'Fix the layout shift issue on mobile devices.', status: 'completed', priority: 'Low', assignee: { name: 'Sarah', avatar: '' }, dueDate: 'Apr 28' },
]

export default function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks)

  const onMoveTask = async (taskId: string, newStatus: string) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    try {
      await updateTaskStatus(taskId, newStatus)
    } catch (err) {
      console.error(err)
      // Rollback if needed
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Task Board</h1>
          <p className="text-slate-400 mt-1">Visualize and manage your team's workflow.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input 
              placeholder="Search tasks..." 
              className="pl-10 bg-slate-900/50 border-slate-800 text-white"
            />
          </div>
          <Button variant="outline" className="border-slate-800 text-slate-400 gap-2">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col gap-4 min-h-[500px]">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${column.color}`} />
                <h3 className="font-semibold text-white uppercase text-xs tracking-wider">{column.title}</h3>
                <Badge variant="outline" className="ml-2 bg-slate-900 border-slate-800 text-slate-500 text-[10px]">
                  {tasks.filter(t => t.status === column.id).length}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 space-y-4 p-2 rounded-xl bg-slate-950/30 border border-dashed border-slate-800/50">
              <AnimatePresence mode="popLayout">
                {tasks
                  .filter((task) => task.status === column.id)
                  .map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="bg-slate-900/80 border-slate-800 hover:border-indigo-500/50 transition-colors cursor-grab active:cursor-grabbing group">
                        <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[10px] uppercase font-bold",
                              task.priority === 'Critical' ? 'border-rose-500/50 text-rose-400 bg-rose-500/5' :
                              task.priority === 'High' ? 'border-amber-500/50 text-amber-400 bg-amber-500/5' :
                              'border-slate-700 text-slate-400'
                            )}
                          >
                            {task.priority}
                          </Badge>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-600 group-hover:text-slate-400">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-3">
                          <h4 className="text-sm font-semibold text-slate-200 leading-snug">
                            {task.title}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {task.description}
                          </p>
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                              <Calendar className="w-3 h-3" />
                              <span>{task.dueDate}</span>
                            </div>
                            <Avatar className="h-6 w-6 border border-slate-800">
                              <AvatarFallback className="text-[10px] bg-slate-800 text-slate-400">
                                {task.assignee.name[0]}
                              </AvatarFallback>
                            </Avatar>
                          </div>

                          {/* Quick move buttons for mobile/demo */}
                          <div className="flex gap-1 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {columns.filter(c => c.id !== task.status).map(c => (
                              <Button 
                                key={c.id}
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-[10px] text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 px-2"
                                onClick={() => onMoveTask(task.id, c.id)}
                              >
                                Move to {c.title}
                              </Button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
