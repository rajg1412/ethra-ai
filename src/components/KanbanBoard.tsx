'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MoreHorizontal, Calendar } from 'lucide-react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { updateTaskStatus } from '@/app/(dashboard)/tasks/actions'
import { NewTaskModal } from '@/components/NewTaskModal'
import { cn } from '@/lib/utils'

interface Project { id: string; name: string }

const columns = [
  { id: 'todo',        title: 'To Do',       dot: 'bg-slate-300' },
  { id: 'in_progress', title: 'In Progress',  dot: 'bg-slate-700' },
  { id: 'completed',   title: 'Done',         dot: 'bg-black'     },
]

const priorityClass: Record<string, string> = {
  high:   'border-black/30 text-black bg-slate-50',
  medium: 'border-slate-200 text-slate-500',
  low:    'border-slate-100 text-slate-400',
}

export function KanbanBoard({
  initialTasks,
  projects = [],
}: {
  initialTasks: any[]
  projects?: Project[]
}) {
  const [tasks, setTasks] = useState(initialTasks)

  const onMoveTask = async (taskId: string, newStatus: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    try { await updateTaskStatus(taskId, newStatus) } catch {}
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {columns.map((col) => {
        const colTasks = tasks.filter(t => t.status === col.id)
        return (
          <div key={col.id} className="flex flex-col gap-3">
            {/* Column header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className={cn('w-2 h-2 rounded-full', col.dot)} />
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-widest">
                  {col.title}
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  {colTasks.length}
                </span>
              </div>
              <NewTaskModal projects={projects} defaultProjectId={projects[0]?.id}>
                <div role="button" className="h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />
                </div>
              </NewTaskModal>
            </div>

            {/* Column body */}
            <div className="flex-1 min-h-48 space-y-3 p-2 rounded-lg bg-slate-50 border border-slate-200">
              <AnimatePresence mode="popLayout">
                {colTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Card className="bg-white border-slate-200 hover:border-black transition-colors group shadow-none">
                      <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] uppercase font-semibold shrink-0',
                            priorityClass[task.priority] ?? 'border-slate-200 text-slate-400'
                          )}
                        >
                          {task.priority}
                        </Badge>
                        <button className="h-6 w-6 flex items-center justify-center rounded text-slate-300 group-hover:text-slate-500 transition-colors -mr-1 shrink-0">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </CardHeader>
                      <CardContent className="p-3 pt-2 space-y-2.5">
                        <p className="text-sm font-semibold text-slate-800 leading-snug">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {task.due_date
                                ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                : 'No date'}
                            </span>
                          </div>
                          <Avatar className="h-5 w-5 border border-slate-200">
                            <AvatarFallback className="text-[9px] bg-slate-100 text-slate-500">
                              {task.profiles?.full_name?.[0]?.toUpperCase() ?? 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        {/* Move buttons — appear on hover */}
                        <div className="flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pt-0.5">
                          {columns
                            .filter(c => c.id !== task.status)
                            .map(c => (
                              <button
                                key={c.id}
                                onClick={() => onMoveTask(task.id, c.id)}
                                className="text-[10px] text-slate-500 border border-slate-200 hover:border-black hover:text-black px-2 py-0.5 rounded transition-all"
                              >
                                → {c.title}
                              </button>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {colTasks.length === 0 && (
                  <motion.p
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-xs text-slate-400 py-8"
                  >
                    No tasks
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        )
      })}
    </div>
  )
}
