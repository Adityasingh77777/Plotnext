"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Shield } from "lucide-react"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Use client-side redirect to avoid error boundary issues
    router.replace("/login")
  }, [router])

  // Show a loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Shield className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
        <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
      </div>
    </div>
  )
}
