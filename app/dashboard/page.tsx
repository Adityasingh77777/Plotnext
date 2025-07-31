"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, LogOut, User } from "lucide-react"
import { PermissionsTab } from "@/components/permissions-tab"
import { RolesTab } from "@/components/roles-tab"
import { NaturalLanguageTab } from "@/components/natural-language-tab"
import { api } from "@/lib/api"
import { isDemoMode } from "@/lib/supabase"
import type { User as SupabaseUser, AuthChangeEvent, Session } from "@supabase/supabase-js"

export default function DashboardPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await api.auth.getUser()

        if (!user) {
          router.replace("/login")
        } else {
          setUser(user)
        }
      } catch (error) {
        console.error("Auth error:", error)
        router.replace("/login")
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Only set up auth state change listener for real Supabase
    if (!isDemoMode) {
      const {
        data: { subscription },
      } = api.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
        if (event === "SIGNED_OUT" || !session) {
          router.replace("/login")
        }
      })

      return () => subscription.unsubscribe()
    }
  }, [router])

  const handleLogout = async () => {
    await api.auth.signOut()
    router.replace("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Permissions & Roles Configurator</h1>
                {isDemoMode && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    Demo Mode - Full Functionality
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <User className="h-4 w-4 mr-2" />
                {user?.email}
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>RBAC Management Dashboard</CardTitle>
              <CardDescription>
                <strong>What is RBAC?</strong> RBAC is like giving keys to rooms. Each role has keys (permissions) to
                open certain doors. A viewer can open only the reading room, an editor can open the writing room too,
                and an admin has keys to all doors.
                {isDemoMode && (
                  <div className="mt-2 text-blue-600 dark:text-blue-400">
                    <strong>Demo Mode:</strong> All CRUD operations work perfectly! Create, edit, delete permissions and
                    roles. Data persists during your session.
                  </div>
                )}
              </CardDescription>
            </CardHeader>
          </Card>

          <Tabs defaultValue="permissions" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="natural-language">Natural Language</TabsTrigger>
            </TabsList>

            <TabsContent value="permissions">
              <PermissionsTab />
            </TabsContent>

            <TabsContent value="roles">
              <RolesTab />
            </TabsContent>

            <TabsContent value="natural-language">
              <NaturalLanguageTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
