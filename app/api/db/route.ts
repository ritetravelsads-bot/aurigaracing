import { NextResponse } from "next/server"
import { createClient } from "@/lib/mongodb/server"
import { getUser } from "@/lib/mongodb/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { table, operation, options, filters, limit, single } = body

    // Get current user for authorization
    const { user } = await getUser()

    // Some tables require authentication
    const protectedTables = [
      "cart_items",
      "wishlist",
      "orders",
      "addresses",
      "tickets",
      "ticket_replies",
      "reviews",
      "loyalty_points",
      "price_alerts",
      "stock_notifications",
      "product_comparisons",
      "recently_viewed",
      "abandoned_carts",
    ]

    if (protectedTables.includes(table) && !user) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 })
    }

    const db = await createClient()
    let result: { data: unknown; error: Error | null }

    switch (operation) {
      case "select": {
        let query = db.from(table).select(options.fields || "*")

        // Apply filters
        for (const [field, value] of Object.entries(filters)) {
          if (field === "_order") {
            const orderOpts = value as { field: string; ascending: boolean }
            query = query.order(orderOpts.field, { ascending: orderOpts.ascending })
          } else if (field === "_or" && typeof value === "string") {
            query = query.or(value)
          } else if (typeof value === "object" && value !== null) {
            const op = Object.keys(value)[0]
            const val = (value as Record<string, unknown>)[op]
            switch (op) {
              case "$eq":
                query = query.eq(field, val)
                break
              case "$neq":
                query = query.neq(field, val)
                break
              case "$gt":
                query = query.gt(field, val)
                break
              case "$gte":
                query = query.gte(field, val)
                break
              case "$lt":
                query = query.lt(field, val)
                break
              case "$lte":
                query = query.lte(field, val)
                break
              case "$in":
                query = query.in(field, val as unknown[])
                break
              case "$is":
                query = query.is(field, val)
                break
              case "$ilike":
                query = query.ilike(field, val as string)
                break
              case "$like":
                query = query.like(field, val as string)
                break
              case "$not": {
                const notVal = val as { op: string; value: unknown }
                query = query.not(field, notVal.op, notVal.value)
                break
              }
            }
          }
        }

        if (limit) {
          query = query.limit(limit)
        }

        if (single) {
          query = query.maybeSingle()
        }

        result = await query
        break
      }

      case "insert": {
        // Add user_id for user-specific tables
        let data = options.data
        if (user && protectedTables.includes(table)) {
          data = { ...data, user_id: user.id }
        }
        result = await db.from(table).insert(data)
        break
      }

      case "update": {
        let query = db.from(table).update(options.data)

        for (const [field, value] of Object.entries(filters)) {
          if (typeof value === "object" && value !== null) {
            const op = Object.keys(value)[0]
            const val = (value as Record<string, unknown>)[op]
            if (op === "$eq") {
              query = query.eq(field, val)
            }
          }
        }

        result = await query
        break
      }

      case "delete": {
        let query = db.from(table).delete()

        for (const [field, value] of Object.entries(filters)) {
          if (typeof value === "object" && value !== null) {
            const op = Object.keys(value)[0]
            const val = (value as Record<string, unknown>)[op]
            if (op === "$eq") {
              query = query.eq(field, val)
            }
          }
        }

        result = await query
        break
      }

      case "upsert": {
        let data = options.data
        if (user && protectedTables.includes(table)) {
          data = { ...data, user_id: user.id }
        }
        result = await db.from(table).upsert(data)
        break
      }

      default:
        return NextResponse.json({ data: null, error: "Invalid operation" }, { status: 400 })
    }

    return NextResponse.json({ data: result.data, error: result.error?.message || null })
  } catch (error) {
    console.error("Database API error:", error)
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 })
  }
}
