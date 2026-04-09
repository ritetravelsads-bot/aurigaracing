import { MongoClient, Db, ObjectId } from "mongodb"

if (!process.env.MONGODB_URI) {
  console.warn("MONGODB_URI not set - using fallback client")
}

// Handle special characters in MongoDB URI password
function encodeMongoUri(rawUri: string): string {
  if (!rawUri) return rawUri
  
  try {
    // Parse the URI to extract and encode the password
    const match = rawUri.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@(.+)$/)
    if (match) {
      const [, protocol, username, password, rest] = match
      // Encode username and password to handle special characters
      const encodedUsername = encodeURIComponent(username)
      const encodedPassword = encodeURIComponent(password)
      return `${protocol}${encodedUsername}:${encodedPassword}@${rest}`
    }
    return rawUri
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
