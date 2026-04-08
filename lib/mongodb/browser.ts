"use client"

// Store for auth state change listeners
const authListeners = new Set<(event: string, session: { user: unknown } | null) => void>()

// Client-side auth operations that call API routes
export function createClient() {
  return {
    auth: {
      getUser: async () => {
        try {
          const response = await fetch("/api/auth/user", {
            method: "GET",
            credentials: "include",
          })
          const data = await response.json()
          return { data: { user: data.user, session: data.user ? {} : null }, error: null }
        } catch (error) {
          return { data: { user: null, session: null }, error }
        }
      },
      signUp: async ({
        email,
        password,
        options,
      }: {
        email: string
        password: string
        options?: { emailRedirectTo?: string; data?: { first_name?: string; last_name?: string; role?: string } }
      }) => {
        try {
          const response = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              email,
              password,
              firstName: options?.data?.first_name || "",
              lastName: options?.data?.last_name || "",
              role: options?.data?.role || "customer",
            }),
          })
          const data = await response.json()
          if (!response.ok) {
            return { data: { user: null }, error: new Error(data.error || "Sign up failed") }
          }
          // Notify listeners about sign in
          authListeners.forEach((callback) => callback("SIGNED_IN", { user: data.user }))
          return { data: { user: data.user }, error: null }
        } catch (error) {
          return { data: { user: null }, error }
        }
      },
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password }),
          })
          const data = await response.json()
          if (!response.ok) {
            return { data: { user: null, session: null }, error: new Error(data.error || "Login failed") }
          }
          // Notify listeners about sign in
          authListeners.forEach((callback) => callback("SIGNED_IN", { user: data.user }))
          return { data: { user: data.user, session: {} }, error: null }
        } catch (error) {
          return { data: { user: null, session: null }, error }
        }
      },
      signOut: async () => {
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          })
          // Notify all listeners about sign out
          authListeners.forEach((callback) => callback("SIGNED_OUT", null))
          return { error: null }
        } catch (error) {
          return { error }
        }
      },
      onAuthStateChange: (callback: (event: string, session: { user: unknown } | null) => void) => {
        // Add to listeners
        authListeners.add(callback)
        
        // Return subscription object with unsubscribe method
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                authListeners.delete(callback)
              },
            },
          },
        }
      },
    },
    from: (tableName: string) => {
      // Client-side database operations call API routes
      return {
        select: (fields = "*") => createClientQueryBuilder(tableName, "select", { fields }),
        insert: (data: Record<string, unknown>) => createClientQueryBuilder(tableName, "insert", { data }),
        update: (data: Record<string, unknown>) => createClientQueryBuilder(tableName, "update", { data }),
        delete: () => createClientQueryBuilder(tableName, "delete", {}),
        upsert: (data: Record<string, unknown>) => createClientQueryBuilder(tableName, "upsert", { data }),
      }
    },
  }
}

function createClientQueryBuilder(
  tableName: string,
  operation: string,
  options: Record<string, unknown>
) {
  const filters: Record<string, unknown> = {}
  let limit: number | null = null
  let single = false
  let maybeSingle = false

  const builder = {
    eq: (field: string, value: unknown) => {
      filters[field] = { $eq: value }
      return builder
    },
    neq: (field: string, value: unknown) => {
      filters[field] = { $neq: value }
      return builder
    },
    gt: (field: string, value: unknown) => {
      filters[field] = { $gt: value }
      return builder
    },
    gte: (field: string, value: unknown) => {
      filters[field] = { $gte: value }
      return builder
    },
    lt: (field: string, value: unknown) => {
      filters[field] = { $lt: value }
      return builder
    },
    lte: (field: string, value: unknown) => {
      filters[field] = { $lte: value }
      return builder
    },
    in: (field: string, values: unknown[]) => {
      filters[field] = { $in: values }
      return builder
    },
    is: (field: string, value: unknown) => {
      filters[field] = { $is: value }
      return builder
    },
    or: (orFilter: string) => {
      filters._or = orFilter
      return builder
    },
    order: (field: string, opts?: { ascending?: boolean }) => {
      filters._order = { field, ascending: opts?.ascending ?? true }
      return builder
    },
    limit: (n: number) => {
      limit = n
      return builder
    },
    single: () => {
      single = true
      return builder
    },
    maybeSingle: () => {
      maybeSingle = true
      return builder
    },
    select: () => builder,
    then: async (
      onfulfilled?: (value: { data: unknown; error: Error | null }) => unknown
    ) => {
      try {
        const response = await fetch("/api/db", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            table: tableName,
            operation,
            options,
            filters,
            limit,
            single: single || maybeSingle,
          }),
        })
        const result = await response.json()
        const value = { data: result.data, error: result.error ? new Error(result.error) : null }
        return onfulfilled ? onfulfilled(value) : value
      } catch (error) {
        const value = { data: null, error: error as Error }
        return onfulfilled ? onfulfilled(value) : value
      }
    },
  }

  return builder
}

export const createBrowserClient = createClient
