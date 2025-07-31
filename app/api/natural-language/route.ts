import { type NextRequest, NextResponse } from "next/server"
import { api } from "@/lib/api"

export async function POST(request: NextRequest) {
  try {
    const { command } = await request.json()

    if (!command || typeof command !== "string") {
      return NextResponse.json({ error: "Command is required" }, { status: 400 })
    }

    const result = await processNaturalLanguageCommand(command.toLowerCase())

    return NextResponse.json({ result })
  } catch (error) {
    console.error("Natural language processing error:", error)
    return NextResponse.json({ error: "Failed to process command" }, { status: 500 })
  }
}

async function processNaturalLanguageCommand(command: string): Promise<string> {
  // Create permission patterns
  const createPermissionMatch = command.match(
    /create.*permission.*['"]([^'"]+)['"](?:.*description.*['"]([^'"]+)['"])?/i,
  )
  if (createPermissionMatch) {
    const name = createPermissionMatch[1]
    const description = createPermissionMatch[2] || ""

    try {
      const { error } = await api.permissions.create(name, description)

      if (error) {
        if (error.code === "23505" || error.message.includes("already exists")) {
          return `❌Permission '${name}' already exists.`
        }
        throw error
      }

      return `✅ Created permission '${name}'${description ? ` with description '${description}'` : ""}.`
    } catch (error: any) {
      return `❌ Failed to create permission: ${error.message}`
    }
  }

  // Create role patterns
  const createRoleMatch = command.match(/create.*role.*['"]([^'"]+)['"](?:.*description.*['"]([^'"]+)['"])?/i)
  if (createRoleMatch) {
    const name = createRoleMatch[1]

    try {
      const { error } = await api.roles.create(name)

      if (error) {
        if (error.code === "23505" || error.message.includes("already exists")) {
          return `❌ Role '${name}' already exists.`
        }
        throw error
      }

      return `✅ Created role '${name}'.`
    } catch (error: any) {
      return `❌ Failed to create role: ${error.message}`
    }
  }

  // Assign permission to role patterns
  const assignMatch = command.match(
    /give.*role.*['"]([^'"]+)['"].*permission.*['"]([^'"]+)['"]|assign.*permission.*['"]([^'"]+)['"].*role.*['"]([^'"]+)['"]|add.*permission.*['"]([^'"]+)['"].*role.*['"]([^'"]+)['"]|role.*['"]([^'"]+)['"].*permission.*['"]([^'"]+)['"]|permission.*['"]([^'"]+)['"].*role.*['"]([^'"]+)['"]|['"]([^'"]+)['"].*permission.*['"]([^'"]+)['"]|['"]([^'"]+)['"].*role.*['"]([^'"]+)['"].*permission/i,
  )
  if (assignMatch) {
    const roleName =
      assignMatch[1] ||
      assignMatch[4] ||
      assignMatch[6] ||
      assignMatch[7] ||
      assignMatch[9] ||
      assignMatch[11] ||
      assignMatch[13]
    const permissionName =
      assignMatch[2] ||
      assignMatch[3] ||
      assignMatch[5] ||
      assignMatch[8] ||
      assignMatch[10] ||
      assignMatch[12] ||
      assignMatch[14]

    try {
      // Get role and permission
      const { data: role } = await api.roles.getByName(roleName)
      const { data: permission } = await api.permissions.getByName(permissionName)

      if (!role) {
        return `❌ Role '${roleName}' not found. Please create it first.`
      }

      if (!permission) {
        return `❌ Permission '${permissionName}' not found. Please create it first.`
      }

      // Get current role data to check existing permissions
      const { data: roleData } = await api.roles.getAll()
      const currentRole = roleData?.find((r: any) => r.id === role.id)
      const currentPermissions = currentRole?.role_permissions?.map((rp: any) => rp.permissions.id) || []

      if (currentPermissions.includes(permission.id)) {
        return `ℹ️ Role '${roleName}' already has permission '${permissionName}'.`
      }

      // Add the new permission to existing ones
      const updatedPermissions = [...currentPermissions, permission.id]
      const { error } = await api.roles.updatePermissions(role.id, updatedPermissions)

      if (error) throw error

      return `✅ Assigned permission '${permissionName}' to role '${roleName}'.`
    } catch (error: any) {
      return `❌ Failed to assign permission: ${error.message}`
    }
  }

  // Remove permission from role patterns
  const removeMatch = command.match(
    /remove.*permission.*['"]([^'"]+)['"].*role.*['"]([^'"]+)['"]|revoke.*permission.*['"]([^'"]+)['"].*role.*['"]([^'"]+)['"]|take.*permission.*['"]([^'"]+)['"].*role.*['"]([^'"]+)['"]|delete.*permission.*['"]([^'"]+)['"].*role.*['"]([^'"]+)['"]|role.*['"]([^'"]+)['"].*remove.*permission.*['"]([^'"]+)['"]|role.*['"]([^'"]+)['"].*revoke.*permission.*['"]([^'"]+)['"]|role.*['"]([^'"]+)['"].*delete.*permission.*['"]([^'"]+)['"]|role.*['"]([^'"]+)['"].*take.*permission.*['"]([^'"]+)['"]|role.*['"]([^'"]+)['"].*permission.*['"]([^'"]+)['"].*remove|role.*['"]([^'"]+)['"].*permission.*['"]([^'"]+)['"].*revoke|role.*['"]([^'"]+)['"].*permission.*['"]([^'"]+)['"].*delete|role.*['"]([^'"]+)['"].*permission.*['"]([^'"]+)['"].*take/i,
  )
  if (removeMatch) {
    const permissionName =
      removeMatch[1] ||
      removeMatch[3] ||
      removeMatch[5] ||
      removeMatch[7] ||
      removeMatch[10] ||
      removeMatch[12] ||
      removeMatch[14] ||
      removeMatch[16] ||
      removeMatch[18] ||
      removeMatch[20] ||
      removeMatch[22] ||
      removeMatch[24]
    const roleName =
      removeMatch[2] ||
      removeMatch[4] ||
      removeMatch[6] ||
      removeMatch[8] ||
      removeMatch[9] ||
      removeMatch[11] ||
      removeMatch[13] ||
      removeMatch[15] ||
      removeMatch[17] ||
      removeMatch[19] ||
      removeMatch[21] ||
      removeMatch[23]

    try {
      // Get role and permission
      const { data: role } = await api.roles.getByName(roleName)
      const { data: permission } = await api.permissions.getByName(permissionName)

      if (!role) {
        return `❌ Role '${roleName}' not found.`
      }

      if (!permission) {
        return `❌ Permission '${permissionName}' not found.`
      }

      // Get current role data
      const { data: roleData } = await api.roles.getAll()
      const currentRole = roleData?.find((r: any) => r.id === role.id)
      const currentPermissions = currentRole?.role_permissions?.map((rp: any) => rp.permissions.id) || []

      if (!currentPermissions.includes(permission.id)) {
        return `ℹ️ Role '${roleName}' doesn't have permission '${permissionName}'.`
      }

      // Remove the permission
      const updatedPermissions = currentPermissions.filter((id: string) => id !== permission.id)
      const { error } = await api.roles.updatePermissions(role.id, updatedPermissions)

      if (error) throw error

      return `✅ Removed permission '${permissionName}' from role '${roleName}'.`
    } catch (error: any) {
      return `❌ Failed to remove permission: ${error.message}`
    }
  }

  return '🤔 I couldn\'t understand that command. Please try using one of the example formats like:\n• \'Create a new permission called "manage posts"\'\n• \'Give the role "Editor" the permission to "edit articles"\'\n• \'Remove the permission "delete posts" from role "Editor"\''
}
