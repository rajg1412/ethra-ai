'use client'

import React from 'react'
import { MoreVertical, Shield, UserMinus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { updateMemberRole, removeMember } from '@/actions/team'
import { toast } from 'sonner'

type Props = {
  projectId: string
  memberId: string
  currentRole: 'admin' | 'member'
  canManage: boolean
  isOwner?: boolean
}

export function TeamMemberActions({
  projectId,
  memberId,
  currentRole,
  canManage,
  isOwner = false,
}: Props) {
  if (!canManage || isOwner) {
    return null
  }

  const flipRole = async () => {
    const nextRole = currentRole === 'admin' ? 'member' : 'admin'
    const formData = new FormData()
    formData.set('projectId', projectId)
    formData.set('memberId', memberId)
    formData.set('role', nextRole)

    try {
      await updateMemberRole(formData)
      toast.success(`Member role updated to ${nextRole}.`)
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to update role.')
    }
  }

  const onRemove = async () => {
    if (!window.confirm('Remove this member from the project?')) {
      return
    }

    const formData = new FormData()
    formData.set('projectId', projectId)
    formData.set('memberId', memberId)

    try {
      await removeMember(formData)
      toast.success('Member removed.')
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove member.')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button className="h-8 w-8 flex items-center justify-center rounded-md text-slate-400 hover:text-black hover:bg-slate-100 transition-colors ml-auto">
            <MoreVertical className="w-4 h-4" />
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-44 bg-white border-slate-200 shadow-lg">
        <DropdownMenuItem className="text-sm cursor-pointer focus:bg-slate-50 gap-2" onClick={flipRole}>
          <Shield className="w-4 h-4 text-slate-500" />
          {currentRole === 'admin' ? 'Remove Admin' : 'Make Admin'}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-sm cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 gap-2"
          onClick={onRemove}
        >
          <UserMinus className="w-4 h-4" />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
