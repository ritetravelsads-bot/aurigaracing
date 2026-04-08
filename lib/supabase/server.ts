import { createServerClient as createSupabaseServerClient, type SupabaseClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Result for normal queries (.from().select() etc.) — `data` is null so `|| []` fallbacks work.
const QUERY_RESULT = Object.freeze({ data: null, error: null, count: null, status: 200, statusText: "OK" })

// Result for auth methods (.auth.getUser() etc.) — `data.user` is null so destructuring works.
const AUTH_RESULT = Object.freeze({
  data: Object.freeze({ user: null, session: null }),
  error: null,
})

// Fallback client that returns empty data for all queries when Supabase is not configured.
function createFallbackClient(): SupabaseClient {

  function makeChainable(result: Record<string, unknown> = QUERY_RESULT): unknown {
    return new Proxy(() => {}, {
      get(_target, prop) {
        if (prop === "then") {
          return (resolve?: (v: unknown) => void) => Promise.resolve(result).then(resolve)
        }
        if (prop === "catch") return () => Promise.resolve(result)
        if (prop === "finally") return (cb?: () => void) => { cb?.(); return Promise.resolve(result) }
        return makeChainable(result)
      },
      apply() {
        return makeChainable(result)
      },
    })
  }

  return new Proxy({} as SupabaseClient, {
    get(_target, prop) {
      if (prop === "then" || prop === "catch" || prop === "finally") return undefined
      // Auth methods need { data: { user: null } } for destructuring
      if (prop === "auth") return makeChainable(AUTH_RESULT)
      return makeChainable(QUERY_RESULT)
    },
  })
}

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return createFallbackClient()
  }

  const cookieStore = await cookies()

  return createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

export async function createServerClient() {
  return createClient()
}
