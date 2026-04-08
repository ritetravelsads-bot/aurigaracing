import { NextResponse, type NextRequest } from "next/server"
import { getDb, ObjectId } from "@/lib/mongodb/client"
import type { Session, User } from "@/lib/mongodb/models"

const SESSION_COOKIE_NAME = "auth_session"

export async function updateSession(request: NextRequest) {
  const db = await getDb()

  // If no database connection, skip auth checks and continue
  if (!db) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  // Get session from cookie
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value

  let user: (User & { id: string }) | null = null

  if (sessionToken) {
    try {
      const sessionsCollection = db.collection<Session>("sessions")
      const session = await sessionsCollection.findOne({
        token: sessionToken,
        expires_at: { $gt: new Date() },
      })

      if (session) {
        const usersCollection = db.collection<User>("users")
        const dbUser = await usersCollection.findOne({
          _id: new ObjectId(session.user_id),
          is_active: true,
        })

        if (dbUser) {
          const { _id, password_hash, ...userData } = dbUser
          user = { ...userData, id: _id.toHexString() } as User & { id: string }
        }
      }
    } catch (error) {
      console.error("Session validation error:", error)
    }
  }

  // Protected routes that require authentication
  const protectedPaths = ["/account", "/admin", "/manager", "/checkout"]
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("redirect", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Role-based access control
  if (user && request.nextUrl.pathname.startsWith("/admin")) {
    if (user.role !== "admin") {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
  }

  if (user && request.nextUrl.pathname.startsWith("/manager")) {
    if (user.role !== "manager" && user.role !== "admin") {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
