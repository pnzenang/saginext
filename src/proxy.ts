import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/api/language',
  '/blog(.*)',
  '/manifest.json',
  '/robots.txt',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sitemap.xml'
])

const isAdminRoute = createRouteMatcher(['/admin(.*)'])

const profileRoutes = new Map([
  ['/profile', '/profile'],
  ['/profiles', '/profile'],
  ['/profile/page', '/profile'],
  ['/profile/page.tsx', '/profile'],
  ['/profile/create', '/profile/create'],
  ['/profiles/create', '/profile/create'],
  ['/profile/create/page', '/profile/create'],
  ['/profile/create/page.tsx', '/profile/create']
])

const getCanonicalProfilePath = (pathname: string) => {
  const normalizedPathname = pathname.replace(/(?:%20|\s)+$/gi, '').toLowerCase()

  return profileRoutes.get(normalizedPathname)
}

const getCanonicalAdminDeceasedPath = (pathname: string) => {
  const match = pathname.match(/^\/admin-deceased(?=$|\/)(.*)$/i)

  return match ? `/admin-all-deceased${match[1] ?? ''}` : undefined
}

export default clerkMiddleware(async (auth, req) => {
  const requestHeaders = new Headers(req.headers)

  requestHeaders.set('x-pathname', req.nextUrl.pathname)

  const canonicalProfilePath = getCanonicalProfilePath(req.nextUrl.pathname)

  if (canonicalProfilePath && canonicalProfilePath !== req.nextUrl.pathname) {
    const url = req.nextUrl.clone()

    url.pathname = canonicalProfilePath

    return NextResponse.redirect(url)
  }

  const isAdmin = (await auth()).userId === process.env.ADMIN_USER_ID

  if (isAdminRoute(req) && !isAdmin) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  const canonicalAdminDeceasedPath = getCanonicalAdminDeceasedPath(req.nextUrl.pathname)

  if (canonicalAdminDeceasedPath && canonicalAdminDeceasedPath !== req.nextUrl.pathname) {
    const url = req.nextUrl.clone()

    url.pathname = canonicalAdminDeceasedPath

    return NextResponse.redirect(url)
  }

  if (!isPublicRoute(req)) {
    await auth.protect()
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  })
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',

    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
}
