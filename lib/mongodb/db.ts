import { getDb, ObjectId } from "./client"
import type { Collection, Filter, Sort, Document, WithId } from "mongodb"

// Helper to normalize MongoDB documents (convert _id to id)
function normalizeDoc<T extends Document>(doc: WithId<T> | null): (T & { id: string }) | null {
  if (!doc) return null
  const { _id, ...rest } = doc
  return { ...rest, id: _id.toHexString() } as T & { id: string }
}

function normalizeDocs<T extends Document>(docs: WithId<T>[]): (T & { id: string })[] {
  return docs.map((doc) => normalizeDoc(doc)!)
}

// Query builder that mimics Supabase's chainable API
class QueryBuilder<T extends Document> {
  private collectionName: string
  private filters: Filter<T> = {}
  private sortOptions: Sort = {}
  private limitValue: number | null = null
  private skipValue: number | null = null
  private selectFields: string[] | null = null
  private singleResult = false
  private maybeSingleResult = false
  private countOnly = false
  private headOnly = false

  constructor(collectionName: string) {
    this.collectionName = collectionName
  }

  select(fields: string = "*", options?: { count?: "exact"; head?: boolean }) {
    if (fields !== "*") {
      this.selectFields = fields.split(",").map((f) => f.trim())
    }
    if (options?.count === "exact") {
      this.countOnly = true
    }
    if (options?.head) {
      this.headOnly = true
    }
    return this
  }

  eq(field: string, value: unknown) {
    if (field === "id") {
      this.filters._id = new ObjectId(value as string) as unknown as Filter<T>[keyof Filter<T>]
    } else {
      (this.filters as Record<string, unknown>)[field] = value
    }
    return this
  }

  neq(field: string, value: unknown) {
    (this.filters as Record<string, unknown>)[field] = { $ne: value }
    return this
  }

  gt(field: string, value: unknown) {
    (this.filters as Record<string, unknown>)[field] = { $gt: value }
    return this
  }

  gte(field: string, value: unknown) {
    (this.filters as Record<string, unknown>)[field] = { $gte: value }
    return this
  }

  lt(field: string, value: unknown) {
    (this.filters as Record<string, unknown>)[field] = { $lt: value }
    return this
  }

  lte(field: string, value: unknown) {
    (this.filters as Record<string, unknown>)[field] = { $lte: value }
    return this
  }

  like(field: string, pattern: string) {
    // Convert SQL LIKE pattern to regex
    const regex = pattern.replace(/%/g, ".*")
    ;(this.filters as Record<string, unknown>)[field] = { $regex: regex, $options: "i" }
    return this
  }

  ilike(field: string, pattern: string) {
    return this.like(field, pattern)
  }

  is(field: string, value: unknown) {
    (this.filters as Record<string, unknown>)[field] = value
    return this
  }

  in(field: string, values: unknown[]) {
    if (field === "id") {
      this.filters._id = { $in: values.map((v) => new ObjectId(v as string)) } as unknown as Filter<T>[keyof Filter<T>]
    } else {
      (this.filters as Record<string, unknown>)[field] = { $in: values }
    }
    return this
  }

  not(field: string, operator: string, value: unknown) {
    if (operator === "is") {
      (this.filters as Record<string, unknown>)[field] = { $ne: value }
    }
    return this
  }

  or(conditions: string) {
    // Parse conditions like "name.ilike.%search%,description.ilike.%search%"
    const parts = conditions.split(",")
    const orConditions: Record<string, unknown>[] = []

    for (const part of parts) {
      const [field, operator, value] = part.split(".")
      if (operator === "ilike") {
        const regex = value.replace(/%/g, ".*")
        orConditions.push({ [field]: { $regex: regex, $options: "i" } })
      }
    }

    if (orConditions.length > 0) {
      ;(this.filters as Record<string, unknown>).$or = orConditions
    }
    return this
  }

  order(field: string, options?: { ascending?: boolean }) {
    const direction = options?.ascending === false ? -1 : 1
    ;(this.sortOptions as Record<string, 1 | -1>)[field] = direction
    return this
  }

  limit(value: number) {
    this.limitValue = value
    return this
  }

  range(start: number, end: number) {
    this.skipValue = start
    this.limitValue = end - start + 1
    return this
  }

  single() {
    this.singleResult = true
    return this
  }

  maybeSingle() {
    this.maybeSingleResult = true
    return this
  }

  async then<TResult1 = { data: (T & { id: string })[] | (T & { id: string }) | null; error: Error | null; count?: number }, TResult2 = never>(
    onfulfilled?: ((value: { data: (T & { id: string })[] | (T & { id: string }) | null; error: Error | null; count?: number }) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    try {
      const db = await getDb()
      if (!db) {
        const result = { data: this.singleResult || this.maybeSingleResult ? null : [], error: null, count: 0 }
        return onfulfilled ? onfulfilled(result) : (result as unknown as TResult1)
      }

      const collection = db.collection<T>(this.collectionName)

      if (this.countOnly && this.headOnly) {
        const count = await collection.countDocuments(this.filters)
        const result = { data: null, error: null, count }
        return onfulfilled ? onfulfilled(result) : (result as unknown as TResult1)
      }

      let cursor = collection.find(this.filters)

      if (Object.keys(this.sortOptions).length > 0) {
        cursor = cursor.sort(this.sortOptions)
      }

      if (this.skipValue !== null) {
        cursor = cursor.skip(this.skipValue)
      }

      if (this.limitValue !== null) {
        cursor = cursor.limit(this.limitValue)
      }

      if (this.singleResult || this.maybeSingleResult) {
        const doc = await cursor.limit(1).next()
        const result = { data: normalizeDoc(doc), error: null }
        return onfulfilled ? onfulfilled(result) : (result as unknown as TResult1)
      }

      const docs = await cursor.toArray()
      const result = { data: normalizeDocs(docs), error: null }
      return onfulfilled ? onfulfilled(result) : (result as unknown as TResult1)
    } catch (error) {
      const result = { data: null, error: error as Error }
      if (onrejected) return onrejected(error)
      return onfulfilled ? onfulfilled(result) : (result as unknown as TResult1)
    }
  }
}

// Insert builder
class InsertBuilder<T extends Document> {
  private collectionName: string
  private data: Partial<T> | Partial<T>[]
  private returnData = false

  constructor(collectionName: string, data: Partial<T> | Partial<T>[]) {
    this.collectionName = collectionName
    this.data = data
  }

  select() {
    this.returnData = true
    return this
  }

  single() {
    return this
  }

  async then<TResult1 = { data: (T & { id: string }) | null; error: Error | null }, TResult2 = never>(
    onfulfilled?: ((value: { data: (T & { id: string }) | null; error: Error | null }) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    try {
      const db = await getDb()
      if (!db) {
        const result = { data: null, error: null }
        return onfulfilled ? onfulfilled(result) : (result as unknown as TResult1)
      }

      const collection = db.collection<T>(this.collectionName)
      const now = new Date()

      if (Array.isArray(this.data)) {
        const docs = this.data.map((d) => ({
          ...d,
          created_at: now,
          updated_at: now,
        })) as T[]
        await collection.insertMany(docs)
        const result = { data: null, error: null }
        return onfulfilled ? onfulfilled(result) : (result as unknown as TResult1)
      } else {
        const doc = {
          ...this.data,
          created_at: now,
          updated_at: now,
        } as T
        const insertResult = await collection.insertOne(doc)
        
        if (this.returnData) {
          const inserted = await collection.findOne({ _id: insertResult.insertedId } as Filter<T>)
          const result = { data: normalizeDoc(inserted), error: null }
          return onfulfilled ? onfulfilled(result) : (result as unknown as TResult1)
        }
        
        const result = { data: null, error: null }
        return onfulfilled ? onfulfilled(result) : (result as unknown as TResult1)
      }
    } catch (error) {
      const result = { data: null, error: error as Error }
      if (onrejected) return onrejected(error)
      return onfulfilled ? onfulfilled(result) : (result as unknown as TResult1)
    }
  }
}

// Update builder
class UpdateBuilder<T extends Document> {
  private collectionName: string
  private updateData: Partial<T>
  private filters: Filter<T> = {}
  private returnData = false

  constructor(collectionName: string, data: Partial<T>) {
    this.collectionName = collectionName
    this.updateData = data
  }

  eq(field: string, value: unknown) {
    if (field === "id") {
      this.filters._id = new ObjectId(value as string) as unknown as Filter<T>[keyof Filter<T>]
    } else {
      (this.filters as Record<string, unknown>)[field] = value
    }
    return this
  }

  in(field: string, values: unknown[]) {
    if (field === "id") {
      this.filters._id = { $in: values.map((v) => new ObjectId(v as string)) } as unknown as Filter<T>[keyof Filter<T>]
    } else {
      (this.filters as Record<string, unknown>)[field] = { $in: values }
    }
    return this
  }

  select() {
    this.returnData = true
    return this
  }

  single() {
    return this
  }

  async then<TResult1 = { data: (T & { id: string }) | null; error: Error | null }, TResult2 = never>(
    onfulfilled?: ((value: { data: (T & { id: string }) | null; error: Error | null }) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    try {
      const db = await getDb()
      if (!db) {
        const result = { data: null, error: null }
        return onfulfilled ? onfulfilled(result) : (result as unknown as TResult1)
      }

      const collection = db.collection<T>(this.collectionName)
      const update = { $set: { ...this.updateData, updated_at: new Date() } }

      await collection.updateMany(this.filters, update)

      if (this.returnData) {
        const doc = await collection.findOne(this.filters)
        const result = { data: normalizeDoc(doc), error: null }
        return onfulfilled ? onfulfilled(result) : (result as unknown as TResult1)
      }

      const result = { data: null, error: null }
      return onfulfilled ? onfulfilled(result) : (result as unknown as TResult1)
    } catch (error) {
      const result = { data: null, error: error as Error }
      if (onrejected) return onrejected(error)
      return onfulfilled ? onfulfilled(result) : (result as unknown as TResult1)
    }
  }
}

// Delete builder
class DeleteBuilder<T extends Document> {
  private collectionName: string
  private filters: Filter<T> = {}

  constructor(collectionName: string) {
    this.collectionName = collectionName
  }

  eq(field: string, value: unknown) {
    if (field === "id") {
      this.filters._id = new ObjectId(value as string) as unknown as Filter<T>[keyof Filter<T>]
    } else {
      (this.filters as Record<string, unknown>)[field] = value
    }
    return this
  }

  in(field: string, values: unknown[]) {
    if (field === "id") {
      this.filters._id = { $in: values.map((v) => new ObjectId(v as string)) } as unknown as Filter<T>[keyof Filter<T>]
    } else {
      (this.filters as Record<string, unknown>)[field] = { $in: values }
    }
    return this
  }

  async then<TResult1 = { data: null; error: Error | null }, TResult2 = never>(
    onfulfilled?: ((value: { data: null; error: Error | null }) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    try {
      const db = await getDb()
      if (!db) {
        const result = { data: null, error: null }
        return onfulfilled ? onfulfilled(result) : (result as unknown as TResult1)
      }

      const collection = db.collection<T>(this.collectionName)
      await collection.deleteMany(this.filters)

      const result = { data: null, error: null }
      return onfulfilled ? onfulfilled(result) : (result as unknown as TResult1)
    } catch (error) {
      const result = { data: null, error: error as Error }
      if (onrejected) return onrejected(error)
      return onfulfilled ? onfulfilled(result) : (result as unknown as TResult1)
    }
  }
}

// Upsert builder
class UpsertBuilder<T extends Document> {
  private collectionName: string
  private data: Partial<T>
  private conflictFields: string[] = []

  constructor(collectionName: string, data: Partial<T>) {
    this.collectionName = collectionName
    this.data = data
  }

  async then<TResult1 = { data: null; error: Error | null }, TResult2 = never>(
    onfulfilled?: ((value: { data: null; error: Error | null }) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    try {
      const db = await getDb()
      if (!db) {
        const result = { data: null, error: null }
        return onfulfilled ? onfulfilled(result) : (result as unknown as TResult1)
      }

      const collection = db.collection<T>(this.collectionName)
      const now = new Date()

      // Build filter from data for upsert
      const filter: Record<string, unknown> = {}
      if ((this.data as Record<string, unknown>).user_id) {
        filter.user_id = (this.data as Record<string, unknown>).user_id
      }
      if ((this.data as Record<string, unknown>).product_id) {
        filter.product_id = (this.data as Record<string, unknown>).product_id
      }

      await collection.updateOne(
        filter as Filter<T>,
        {
          $set: { ...this.data, updated_at: now },
          $setOnInsert: { created_at: now } as Partial<T>,
        },
        { upsert: true }
      )

      const result = { data: null, error: null }
      return onfulfilled ? onfulfilled(result) : (result as unknown as TResult1)
    } catch (error) {
      const result = { data: null, error: error as Error }
      if (onrejected) return onrejected(error)
      return onfulfilled ? onfulfilled(result) : (result as unknown as TResult1)
    }
  }
}

// Main database client that mimics Supabase client structure
export function createDbClient() {
  return {
    from<T extends Document>(tableName: string) {
      return {
        select(fields: string = "*", options?: { count?: "exact"; head?: boolean }) {
          const builder = new QueryBuilder<T>(tableName)
          return builder.select(fields, options)
        },
        insert(data: Partial<T> | Partial<T>[]) {
          return new InsertBuilder<T>(tableName, data)
        },
        update(data: Partial<T>) {
          return new UpdateBuilder<T>(tableName, data)
        },
        delete() {
          return new DeleteBuilder<T>(tableName)
        },
        upsert(data: Partial<T>) {
          return new UpsertBuilder<T>(tableName, data)
        },
      }
    },
  }
}
