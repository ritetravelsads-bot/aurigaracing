import { getDb, ObjectId } from "./client"
import type { User, Session } from "./models"
import { cookies } from "next/headers"
import { randomBytes, createHash } from "crypto"

const SESSION_COOKIE_NAME = "auth_session"
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

// Simple password hashing using crypto (bcrypt alternative for edge compatibility)
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const hash = createHash("sha256")
    .update(password + salt)
    .digest("hex")
  return `${salt}:${hash}`
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":")
  const newHash = createHash("sha256")
    .update(password + salt)
    .digest("hex")
  return hash === newHash
}

function generateSessionToken(): string {
  return randomBytes(32).toString("hex")
}

// Get current user from session
export async function getUser(): Promise<{ user: (User & { id: string }) | null }> {
  try {
    const db = await getDb()
    if (!db) return { user: null }

    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionToken) {
      return { user: null }
    }

    const sessionsCollection = db.collection<Session>("sessions")
    const session = await sessionsCollection.findOne({
      token: sessionToken,
      expires_at: { $gt: new Date() },
    })

    if (!session) {
      return { user: null }
    }

    const usersCollection = db.collection<User>("users")
    const user = await usersCollection.findOne({
      _id: new ObjectId(session.user_id),
      is_active: true,
    })

    if (!user) {
      return { user: null }
    }

    const { _id, password_hash, ...userData } = user
    return { user: { ...userData, id: _id.toHexString() } as User & { id: string } }
  } catch (error) {
    console.error("Error getting user:", error)
    return { user: null }
  }
}

// Sign up new user
export async function signUp({
  email,
  password,
  firstName,
  lastName,
  role = "customer",
}: {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: "customer" | "admin" | "manager"
}): Promise<{ user: (User & { id: string }) | null; error: Error | null }> {
  try {
    const db = await getDb()
    if (!db) return { user: null, error: new Error("Database not available") }

    const usersCollection = db.collection<User>("users")

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return { user: null, error: new Error("User with this email already exists") }
    }

    // Create user
    const now = new Date()
    const passwordHash = hashPassword(password)

    const result = await usersCollection.insertOne({
      email: email.toLowerCase(),
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      role,
      is_active: true,
      email_verified: false,
      created_at: now,
      updated_at: now,
    } as User)

    const user = await usersCollection.findOne({ _id: result.insertedId })
    if (!user) {
      return { user: null, error: new Error("Failed to create user") }
    }

    // Create session
    await createSession(user._id.toHexString())

    const { _id, password_hash, ...userData } = user
    return { user: { ...userData, id: _id.toHexString() } as User & { id: string }, error: null }
  } catch (error) {
    console.error("Sign up error:", error)
    return { user: null, error: error as Error }
  }
}

// Sign in user
export async function signIn({
  email,
  password,
}: {
  email: string
  password: string
}): Promise<{ user: (User & { id: string }) | null; error: Error | null }> {
  try {
    const db = await getDb()
    if (!db) return { user: null, error: new Error("Database not available") }

    const usersCollection = db.collection<User>("users")
    const user = await usersCollection.findOne({
      email: email.toLowerCase(),
      is_active: true,
    })

    if (!user) {
      return { user: null, error: new Error("Invalid email or password") }
    }

    if (!verifyPassword(password, user.password_hash)) {
      return { user: null, error: new Error("Invalid email or password") }
    }

    // Create session
    await createSession(user._id.toHexString())

    const { _id, password_hash, ...userData } = user
    return { user: { ...userData, id: _id.toHexString() } as User & { id: string }, error: null }
  } catch (error) {
    console.error("Sign in error:", error)
    return { user: null, error: error as Error }
  }
}

// Create session
async function createSession(userId: string): Promise<void> {
  const db = await getDb()
  if (!db) return

  const sessionsCollection = db.collection<Session>("sessions")
  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  await sessionsCollection.insertOne({
    user_id: userId,
    token,
    expires_at: expiresAt,
    created_at: new Date(),
  } as Session)

  // Set cookie
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })
}

// Sign out user
export async function signOut(): Promise<void> {
  try {
    const db = await getDb()
    if (!db) return

    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (sessionToken) {
      const sessionsCollection = db.collection<Session>("sessions")
      await sessionsCollection.deleteOne({ token: sessionToken })
    }

    cookieStore.delete(SESSION_COOKIE_NAME)
  } catch (error) {
    console.error("Sign out error:", error)
  }
}

// Update session (for middleware)
export async function updateSession(request: Request): Promise<{ user: (User & { id: string }) | null }> {
  try {
    const db = await getDb()
    if (!db) return { user: null }

    // Get session from cookie header
    const cookieHeader = request.headers.get("cookie")
    if (!cookieHeader) return { user: null }

    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => {
        const [key, ...v] = c.split("=")
        return [key, v.join("=")]
      })
    )

    const sessionToken = cookies[SESSION_COOKIE_NAME]
    if (!sessionToken) return { user: null }

    const sessionsCollection = db.collection<Session>("sessions")
    const session = await sessionsCollection.findOne({
      token: sessionToken,
      expires_at: { $gt: new Date() },
    })

    if (!session) return { user: null }

    const usersCollection = db.collection<User>("users")
    const user = await usersCollection.findOne({
      _id: new ObjectId(session.user_id),
      is_active: true,
    })

    if (!user) return { user: null }

    const { _id, password_hash, ...userData } = user
    return { user: { ...userData, id: _id.toHexString() } as User & { id: string } }
  } catch (error) {
    console.error("Update session error:", error)
    return { user: null }
  }
}

// Auth client wrapper that mimics Supabase auth structure
export function createAuthClient() {
  return {
    auth: {
      getUser: async () => {
        const result = await getUser()
        return { data: { user: result.user, session: result.user ? {} : null }, error: null }
      },
      signUp: async ({
        email,
        password,
        options,
      }: {
        email: string
        password: string
        options?: { data?: { first_name?: string; last_name?: string; role?: string } }
      }) => {
        const result = await signUp({
          email,
          password,
          firstName: options?.data?.first_name || "",
          lastName: options?.data?.last_name || "",
          role: (options?.data?.role as "customer" | "admin" | "manager") || "customer",
        })
        return { data: { user: result.user }, error: result.error }
      },
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        const result = await signIn({ email, password })
        return { data: { user: result.user, session: result.user ? {} : null }, error: result.error }
      },
      signOut: async () => {
        await signOut()
        return { error: null }
      },
    },
  }
}
