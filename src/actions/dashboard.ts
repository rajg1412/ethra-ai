'use server'

import { getDashboardStats as getDashboardStatsService } from '@/lib/services/dashboard.service'

export async function getDashboardStats() {
  return getDashboardStatsService()
}
