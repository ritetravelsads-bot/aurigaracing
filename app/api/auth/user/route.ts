import { NextResponse } from "next/server"
import { getUser } from "@/lib/mongodb/auth"

export async function GET() {
  try {
    const { user } = await getUser()
    return NextResponse.json({ user })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
