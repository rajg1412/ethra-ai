'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MoreHorizontal, Calendar, Trash2 } from 'lucide-react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { deleteTask, updateTaskStatus } from '@/actions/tasks'
import { NewTaskModal } from '@/components/NewTaskModal'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Project { id: string; name: string }
interface Task {
  id: string
  project_id: string
  assigned_to: string | null
  status: string
  priority: string
  title: string
  description?: string | null
  due_date?: string | null
  profiles?: { full_name?: string | null; avatar_url?: string | null } | null
}

const columns = [
  { id: 'todo', title: 'To Do', dot: 'bg-slate-300' },
  { id: 'in_progress', title: 'In Progress', dot: 'bg-slate-700' },
  { id: 'completed', title: 'Done', dot: 'bg-black' },
]

const priorityClass: Record<string, string> = {
  high: 'border-black/30 text-black bg-slate-50',
  medium: 'border-slate-200 text-slate-500',
  low: 'border-slate-100 text-slate-400',
}

export function KanbanBoard({
  initialTasks,
  projects = [],
  currentUserId,
  manageableProjectIds = [],
  canCreateTask = false,
}: {
  initialTasks: Task[]
  projects?: Project[]
  currentUserId: string
  manageableProjectIds?: string[]
  canCreateTask?: boolean
}) {
  const [tasks, setTasks] = useState(initialTasks)
  const manageableProjectSet = new Set(manageableProjectIds)

  const canManageTask = (task: Task) =>
    manageableProjectSet.has(task.project_id) || task.assigned_to === currentUserId

  const canDeleteTask = (task: Task) => manageableProjectSet.has(task.project_id)

  const onMoveTask = async (taskId: string, newStatus: string) => {
    const previousTasks = tasks
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))

    try {
      await updateTaskStatus(taskId, newStatus)
    } catch (error: unknown) {
      setTasks(previousTasks)
      toast.error(error instanceof Error ? error.message : 'Failed to update task.')
    }
  }

  const onDeleteTask = async (taskId: string) => {
    if (!window.confirm('Delete this task?')) {
      return
    }

    const previousTasks = tasks
    setTasks(prev => prev.filter(t => t.id !== taskId))

    try {
      await deleteTask(taskId)
      toast.success('Task deleted.')
    } catch (error: unknown) {
      setTasks(previousTasks)
      toast.error(error instanceof Error ? error.message : 'Failed to delete task.')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {columns.map((col) => {
        const colTasks = tasks.filter(t => t.status === col.id)
        return (
          <div key={col.id} className="flex flex-col gap-3">
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
              {canCreateTask && projects.length > 0 && (
                <NewTaskModal projects={projects} defaultProjectId={projects[0]?.id}>
                  <button className="h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </NewTaskModal>
              )}
            </div>

            <div className="flex-1 min-h-48 space-y-3 p-2 rounded-lg bg-slate-50 border border-slate-200">
              <AnimatePresence mode="popLayout">
                {colTasks.map((task) => {
                  const taskCanMove = canManageTask(task)
                  const taskCanDelete = canDeleteTask(task)

                  return (
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
                          {taskCanDelete ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <button className="h-6 w-6 flex items-center justify-center rounded text-slate-300 group-hover:text-slate-500 transition-colors -mr-1 shrink-0">
                                    <MoreHorizontal className="w-3.5 h-3.5" />
                                  </button>
                                }
                              />
                              <DropdownMenuContent align="end" className="w-36 bg-white border-slate-200 shadow-lg">
                                <DropdownMenuItem
                                  variant="destructive"
                                  className="text-sm cursor-pointer gap-2"
                                  onClick={() => onDeleteTask(task.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Task
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <div className="h-6 w-6 -mr-1 shrink-0" aria-hidden="true" />
                          )}
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

                          <div className="flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pt-0.5">
                            {taskCanMove &&
                              columns
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
                  )
                })}

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
