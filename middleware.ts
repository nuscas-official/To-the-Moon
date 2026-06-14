import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getUserRole } from './src/lib/supabase/role'
import { createAdminClient } from './src/lib/supabase/admin'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session and get user details
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Decode JWT access token to get custom role claim
  const userRole = await getUserRole(supabase)

  // Check if user is deactivated
  if (user) {
    try {
      const adminSupabase = createAdminClient()
      const { data: dbUser } = await adminSupabase
        .from('users')
        .select('is_active')
        .eq('id', user.id)
        .single()

      if (dbUser && dbUser.is_active === false) {
        const redirectResponse = NextResponse.redirect(new URL('/?reason=deactivated', request.url))
        
        // Use a temporary server client bound to the redirectResponse to clear cookies
        const signOutSupabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll() {
                return request.cookies.getAll()
              },
              setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) =>
                  redirectResponse.cookies.set(name, value, options)
                )
              },
            },
          }
        )
        await signOutSupabase.auth.signOut()
        return redirectResponse
      }
    } catch (err) {
      console.error('Middleware deactivation check failed:', err)
    }
  }

  const pathname = request.nextUrl.pathname

  const isAdminPath = pathname.startsWith('/admin')
  const isMemberPath = pathname.startsWith('/member')
  const isAdminApiPath = pathname.startsWith('/api/admin')
  const isMemberApiPath = pathname.startsWith('/api/member')
  const isUploadApiPath = pathname.startsWith('/api/uploads')
  const isAdminMembersPath = pathname.startsWith('/admin/members')
  const isAdminInvitesApiPath = pathname.startsWith('/api/admin/invites')

  // /admin/members/* and /api/admin/invites/* route protection (admin role only)
  if (isAdminMembersPath || isAdminInvitesApiPath) {
    if (!user) {
      if (isAdminInvitesApiPath) {
        return new NextResponse(
          JSON.stringify({ error: 'Forbidden' }),
          { status: 403, headers: { 'content-type': 'application/json' } }
        )
      }
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    if (userRole !== 'admin') {
      if (isAdminInvitesApiPath) {
        return new NextResponse(
          JSON.stringify({ error: 'Forbidden' }),
          { status: 403, headers: { 'content-type': 'application/json' } }
        )
      }
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // /admin/*, /api/admin/*, and /api/uploads/* route protection
  if (isAdminPath || isAdminApiPath || isUploadApiPath) {
    if (!user) {
      if (isAdminApiPath || isUploadApiPath) {
        return new NextResponse(
          JSON.stringify({ error: 'Forbidden' }),
          { status: 403, headers: { 'content-type': 'application/json' } }
        )
      }
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    if (userRole !== 'committee' && userRole !== 'admin') {
      if (isAdminApiPath || isUploadApiPath) {
        return new NextResponse(
          JSON.stringify({ error: 'Forbidden' }),
          { status: 403, headers: { 'content-type': 'application/json' } }
        )
      }
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // /member/* and /api/member/* route protection
  if (isMemberPath || isMemberApiPath) {
    if (!user) {
      if (isMemberApiPath) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        )
      }
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    if (userRole !== 'member' && userRole !== 'committee' && userRole !== 'admin') {
      if (isMemberApiPath) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        )
      }
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Any file with an extension (e.g. svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
