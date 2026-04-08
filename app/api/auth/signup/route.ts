import { NextResponse } from "next/server"
import { signUp } from "@/lib/mongodb/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, role } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const { user, error } = await signUp({
      email,
      password,
      firstName: firstName || "",
      lastName: lastName || "",
      role: role || "customer",
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
