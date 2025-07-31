"use client"

import type React from "react"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, Send, Lightbulb } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function NaturalLanguageTab() {
  const [command, setCommand] = useState("")
  const [result, setResult] = useState("")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const processMutation = useMutation({
    mutationFn: async (command: string) => {
      const response = await fetch("/api/natural-language", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to process command")
      }

      return response.json()
    },
    onSuccess: (data) => {
      setResult(data.result)
      queryClient.invalidateQueries({ queryKey: ["permissions"] })
      queryClient.invalidateQueries({ queryKey: ["roles"] })
      toast({
        title: "Success",
        description: "Command processed successfully",
      })
    },
    onError: (error: any) => {
      setResult(`❌ Error: ${error.message}`)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (command.trim()) {
      processMutation.mutate(command.trim())
    }
  }

  const exampleCommands = [
    "Create a new permission called 'publish content'",
    "Give the role 'Content Editor' the permission to 'edit articles'",
    "Create a role called 'Moderator'",
    "Remove the permission 'delete posts' from role 'Editor'",
    "Create permission 'manage users' with description 'Can create, edit, and delete user accounts'",
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Natural Language Configurator
        </CardTitle>
        <CardDescription>Use plain English to manage roles and permissions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              placeholder="Type your command here... e.g., 'Give the role Content Editor the permission to edit articles'"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              rows={3}
              className="min-h-[100px]"
            />
          </div>
          <Button type="submit" disabled={processMutation.isPending || !command.trim()}>
            {processMutation.isPending ? (
              "Processing..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Process Command
              </>
            )}
          </Button>
        </form>

        {result && (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>{result}</AlertDescription>
          </Alert>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-3">Example Commands</h3>
          <div className="space-y-2">
            {exampleCommands.map((example, index) => (
              <div
                key={index}
                className="p-3 bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => setCommand(example)}
              >
                <p className="text-sm">{example}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Supported Commands:</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Create new permissions and roles</li>
            <li>• Assign permissions to roles</li>
            <li>• Remove permissions from roles</li>
            <li>• Add descriptions to permissions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
