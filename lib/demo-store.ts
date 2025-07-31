import type { Permission, Role } from "@/types"

// Demo data store for persistent state management
class DemoStore {
  private permissions: Permission[] = [
    {
      id: "1",
      name: "read_articles",
      description: "Can view and read articles",
      created_at: "2024-01-01T00:00:00Z",
      role_permissions: [],
    },
    {
      id: "2",
      name: "edit_articles",
      description: "Can create and edit articles",
      created_at: "2024-01-01T00:00:00Z",
      role_permissions: [],
    },
    {
      id: "3",
      name: "delete_articles",
      description: "Can delete articles",
      created_at: "2024-01-01T00:00:00Z",
      role_permissions: [],
    },
    {
      id: "4",
      name: "manage_users",
      description: "Can create, edit, and delete user accounts",
      created_at: "2024-01-01T00:00:00Z",
      role_permissions: [],
    },
  ]

  private roles: Role[] = [
    {
      id: "1",
      name: "Viewer",
      created_at: "2024-01-01T00:00:00Z",
      role_permissions: [],
    },
    {
      id: "2",
      name: "Content Editor",
      created_at: "2024-01-01T00:00:00Z",
      role_permissions: [],
    },
    {
      id: "3",
      name: "Administrator",
      created_at: "2024-01-01T00:00:00Z",
      role_permissions: [],
    },
  ]

  private rolePermissions: { role_id: string; permission_id: string }[] = [
    { role_id: "1", permission_id: "1" }, // Viewer -> read_articles
    { role_id: "2", permission_id: "1" }, // Content Editor -> read_articles
    { role_id: "2", permission_id: "2" }, // Content Editor -> edit_articles
    { role_id: "3", permission_id: "1" }, // Administrator -> read_articles
    { role_id: "3", permission_id: "2" }, // Administrator -> edit_articles
    { role_id: "3", permission_id: "3" }, // Administrator -> delete_articles
    { role_id: "3", permission_id: "4" }, // Administrator -> manage_users
  ]

  private users: { id: string; email: string; password: string }[] = [
    { id: "demo-user-1", email: "admin@test.com", password: "password123" },
  ]

  private currentUser: { id: string; email: string } | null = null

  // Auth methods
  async signIn(email: string, password: string) {
    await this.delay(800)
    const user = this.users.find((u) => u.email === email && u.password === password)
    if (user) {
      this.currentUser = { id: user.id, email: user.email }
      if (typeof window !== "undefined") {
        localStorage.setItem("demo-auth", JSON.stringify(this.currentUser))
      }
      return {
        data: {
          user: this.currentUser,
          session: {
            access_token: "demo-token",
            user: this.currentUser,
          },
        },
        error: null,
      }
    }
    return {
      data: { user: null, session: null },
      error: { message: "Invalid login credentials" },
    }
  }

  async signUp(email: string, password: string) {
    await this.delay(800)

    // Check if user already exists
    const existingUser = this.users.find((u) => u.email === email)
    if (existingUser) {
      return {
        data: { user: null, session: null },
        error: { message: "User already registered" },
      }
    }

    // Create new user
    const newUser = {
      id: `demo-user-${Date.now()}`,
      email,
      password,
    }
    this.users.push(newUser)

    return {
      data: {
        user: { id: newUser.id, email: newUser.email, created_at: new Date().toISOString() },
        session: null,
      },
      error: null,
    }
  }

  async getUser() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("demo-auth")
      if (stored) {
        this.currentUser = JSON.parse(stored)
      }
    }
    return { data: { user: this.currentUser }, error: null }
  }

  async signOut() {
    this.currentUser = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("demo-auth")
    }
    return { error: null }
  }

  // Permission methods
  async getPermissions() {
    await this.delay(300)
    const permissionsWithRoles = this.permissions.map((permission) => ({
      ...permission,
      role_permissions: this.rolePermissions
        .filter((rp) => rp.permission_id === permission.id)
        .map((rp) => ({
          roles: this.roles.find((r) => r.id === rp.role_id)!,
        })),
    }))
    return { data: permissionsWithRoles, error: null }
  }

  async createPermission(name: string, description: string) {
    await this.delay(500)
    const existing = this.permissions.find((p) => p.name === name)
    if (existing) {
      return { data: null, error: { message: "Permission already exists", code: "23505" } }
    }

    const newPermission: Permission = {
      id: `perm-${Date.now()}`,
      name,
      description,
      created_at: new Date().toISOString(),
      role_permissions: [],
    }
    this.permissions.push(newPermission)
    return { data: newPermission, error: null }
  }

  async updatePermission(id: string, name: string, description: string) {
    await this.delay(500)
    const permission = this.permissions.find((p) => p.id === id)
    if (!permission) {
      return { data: null, error: { message: "Permission not found" } }
    }

    const existing = this.permissions.find((p) => p.name === name && p.id !== id)
    if (existing) {
      return { data: null, error: { message: "Permission name already exists", code: "23505" } }
    }

    permission.name = name
    permission.description = description
    return { data: permission, error: null }
  }

  async deletePermission(id: string) {
    await this.delay(500)
    const index = this.permissions.findIndex((p) => p.id === id)
    if (index === -1) {
      return { data: null, error: { message: "Permission not found" } }
    }

    // Remove from role_permissions
    this.rolePermissions = this.rolePermissions.filter((rp) => rp.permission_id !== id)
    this.permissions.splice(index, 1)
    return { data: null, error: null }
  }

  // Role methods
  async getRoles() {
    await this.delay(300)
    const rolesWithPermissions = this.roles.map((role) => ({
      ...role,
      role_permissions: this.rolePermissions
        .filter((rp) => rp.role_id === role.id)
        .map((rp) => ({
          permissions: this.permissions.find((p) => p.id === rp.permission_id)!,
        })),
    }))
    return { data: rolesWithPermissions, error: null }
  }

  async createRole(name: string) {
    await this.delay(500)
    const existing = this.roles.find((r) => r.name === name)
    if (existing) {
      return { data: null, error: { message: "Role already exists", code: "23505" } }
    }

    const newRole: Role = {
      id: `role-${Date.now()}`,
      name,
      created_at: new Date().toISOString(),
      role_permissions: [],
    }
    this.roles.push(newRole)
    return { data: newRole, error: null }
  }

  async updateRole(id: string, name: string) {
    await this.delay(500)
    const role = this.roles.find((r) => r.id === id)
    if (!role) {
      return { data: null, error: { message: "Role not found" } }
    }

    const existing = this.roles.find((r) => r.name === name && r.id !== id)
    if (existing) {
      return { data: null, error: { message: "Role name already exists", code: "23505" } }
    }

    role.name = name
    return { data: role, error: null }
  }

  async deleteRole(id: string) {
    await this.delay(500)
    const index = this.roles.findIndex((r) => r.id === id)
    if (index === -1) {
      return { data: null, error: { message: "Role not found" } }
    }

    // Remove from role_permissions
    this.rolePermissions = this.rolePermissions.filter((rp) => rp.role_id !== id)
    this.roles.splice(index, 1)
    return { data: null, error: null }
  }

  // Role-Permission methods
  async updateRolePermissions(roleId: string, permissionIds: string[]) {
    await this.delay(500)
    // Remove existing permissions for this role
    this.rolePermissions = this.rolePermissions.filter((rp) => rp.role_id !== roleId)

    // Add new permissions
    permissionIds.forEach((permissionId) => {
      this.rolePermissions.push({ role_id: roleId, permission_id: permissionId })
    })

    return { data: null, error: null }
  }

  async getRoleByName(name: string) {
    await this.delay(200)
    const role = this.roles.find((r) => r.name === name)
    return { data: role || null, error: null }
  }

  async getPermissionByName(name: string) {
    await this.delay(200)
    const permission = this.permissions.find((p) => p.name === name)
    return { data: permission || null, error: null }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const demoStore = new DemoStore()
