import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Only run auth refresh on routes that actually need it.
     * This avoids paying the Supabase `getUser()` cost on public or asset requests.
     */
    '/login',
    '/signup',
    '/dashboard/:path*',
    '/projects/:path*',
    '/tasks/:path*',
    '/team/:path*',
    '/settings/:path*',
    '/admin/:path*',
  ],
}
