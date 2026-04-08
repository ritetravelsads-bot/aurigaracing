import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AddressForm } from "@/components/address-form"

export default async function EditAddressPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: address } = await supabase
    .from("addresses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!address) {
    redirect("/account/addresses")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Address</h1>
          <p className="text-muted-foreground mt-1">Update your address information</p>
        </div>

        <AddressForm address={address} />
      </div>
    </div>
  )
}
