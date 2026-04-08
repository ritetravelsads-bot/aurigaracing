import { createDbClient } from "./db"
import { createAuthClient, getUser } from "./auth"

// Main client that combines database and auth operations
// This mimics the Supabase client API for easier migration
export async function createClient() {
  const dbClient = createDbClient()
  const authClient = createAuthClient()

  return {
    ...dbClient,
    ...authClient,
  }
}

export async function createServerClient() {
  return createClient()
}

export { getUser }
