"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Shield, Info } from "lucide-react"
import { api } from "@/lib/api"
import { isDemoMode } from "@/lib/supabase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()
  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await api.auth.getUser()
        if (data.user) {
          router.replace("/dashboard")
        }
      } catch (error) {
        // User not logged in, stay on login page
      }
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Basic client-side validation
    if (!email || !password) {
      setError("Please fill in all fields")
      setLoading(false)
      return
    }

    try {
      let result
      if (isSignUp) {
        result = await api.auth.signUp({ email, password })
        if (result.error) {
          setError(result.error.message)
        } else {
          setError("Account created successfully! You can now sign in.")
          setIsSignUp(false)
          // Clear the form
          setEmail("")
          setPassword("") // Added to clear the password field after successful signup
        }
      } else {
        result = await api.auth.signInWithPassword({ email, password })
        if (result.error) {
          setError(result.error.message)
        } else if (result.data.user) {
          router.replace("/dashboard")
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err)
      setError("Network error. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Permissions & Roles Configurator</CardTitle>
          <CardDescription className="text-center">
            {isSignUp ? "Create your account" : "Sign in to manage your RBAC system"}
            {isDemoMode && (
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  Demo Mode
                </Badge>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isDemoMode && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Running in demo mode with persistent mock data. All features work fully!
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@test.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="password123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert
                variant={
                  error.includes("successfully") || error.includes("Check your email") ? "default" : "destructive"
                }
              >
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSignUp ? "Sign Up" : "Sign In"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError("")
                }}
                disabled={loading}
              >
                {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
              </Button>
            </div>
          </form>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Test Credentials:</strong>
              <br />
              Email: admin@test.com
              <br />
              Password: password123
            </p>
            {isDemoMode && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                Demo mode includes full CRUD operations with persistent data during your session
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
