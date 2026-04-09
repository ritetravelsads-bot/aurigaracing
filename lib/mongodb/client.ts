import { MongoClient, Db, ObjectId } from "mongodb"

if (!process.env.MONGODB_URI) {
  console.warn("MONGODB_URI not set - using fallback client")
}

// Handle special characters in MongoDB URI password
// Only encode if not already encoded to avoid double-encoding
function encodeMongoUri(rawUri: string): string {
  if (!rawUri) return rawUri
  
  try {
    // Use URL API to properly parse and encode the MongoDB URI
    const isAtlas = rawUri.startsWith("mongodb+srv://")
    const protocol = isAtlas ? "mongodb+srv://" : "mongodb://"
    const withoutProtocol = rawUri.replace(/^mongodb(\+srv)?:\/\//, "")
    
    // Find the last @ to split credentials from host (password may contain @)
    const lastAtIndex = withoutProtocol.lastIndexOf("@")
    if (lastAtIndex === -1) {
      return rawUri // No credentials in URI
    }
    
    const credentials = withoutProtocol.substring(0, lastAtIndex)
    const hostAndRest = withoutProtocol.substring(lastAtIndex + 1)
    
    // Find the first : to split username from password
    const colonIndex = credentials.indexOf(":")
    if (colonIndex === -1) {
      return rawUri // No password, just username
    }
    
    const username = credentials.substring(0, colonIndex)
    const password = credentials.substring(colonIndex + 1)
    
    // Check if password is already URL-encoded by seeing if decoding it changes anything
    // If decoding produces the same result, it wasn't encoded
    // If decoding produces a different result, it was already encoded
    let needsEncoding = true
    try {
      const decoded = decodeURIComponent(password)
      // If decoded equals password, it wasn't encoded (or has no special chars)
      // If they differ, it was already encoded - don't double encode
      if (decoded !== password) {
        needsEncoding = false
      }
    } catch {
      // decodeURIComponent throws if there are invalid sequences like lone %
      // This means it has unencoded special chars and needs encoding
      needsEncoding = true
    }
    
    if (!needsEncoding) {
      return rawUri // Already properly encoded
    }
    
    // Encode username and password
    const encodedUsername = encodeURIComponent(username)
    const encodedPassword = encodeURIComponent(password)
    
    return `${protocol}${encodedUsername}:${encodedPassword}@${hostAndRest}`
  } catch {
    return rawUri
  }
}

const uri = encodeMongoUri(process.env.MONGODB_URI || "")
const options = {}

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

if (uri) {
  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect()
    }
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }
}

export async function getMongoClient(): Promise<MongoClient | null> {
  if (!clientPromise) return null
  return clientPromise
}

export async function getDb(): Promise<Db | null> {
  const client = await getMongoClient()
  if (!client) return null
  return client.db(process.env.MONGODB_DB_NAME || "aurigaracing")
}

// Helper to convert string ID to ObjectId
export function toObjectId(id: string): ObjectId {
  return new ObjectId(id)
}

// Helper to convert ObjectId to string
export function fromObjectId(id: ObjectId): string {
  return id.toHexString()
}

// Export for type usage
export { ObjectId }
export type { Db, MongoClient }
