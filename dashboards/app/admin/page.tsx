"use client"

import { useRouter } from "next/navigation"
import { AdminDashboard } from "@/components/admin-dashboard"

export default function AdminPage() {
  const router = useRouter()

  const handleLogout = () => {
    router.push("/login")
  }

  return <AdminDashboard onLogout={handleLogout} />
}
