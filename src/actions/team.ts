'use server'

import { revalidatePath } from 'next/cache'
import {
  inviteMember as inviteMemberService,
  removeMember as removeMemberService,
  updateMemberRole as updateMemberRoleService,
  getTeamMembers as getTeamMembersService,
} from '@/lib/services/team.service'

export async function getTeamMembers() {
  return getTeamMembersService()
}

export async function inviteMember(formData: FormData) {
  const result = await inviteMemberService(Object.fromEntries(formData))
  revalidatePath('/team')
  revalidatePath(`/projects/${result.projectId}`)
  return { name: result.name }
}

export async function updateMemberRole(formData: FormData) {
  const result = await updateMemberRoleService(Object.fromEntries(formData))
  revalidatePath('/team')
  revalidatePath(`/projects/${result.projectId}`)
  return result
}

export async function removeMember(formData: FormData) {
  const result = await removeMemberService(Object.fromEntries(formData))
  revalidatePath('/team')
  revalidatePath(`/projects/${result.projectId}`)
  return result
}
