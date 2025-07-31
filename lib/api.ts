import { supabase, isDemoMode } from "./supabase"
import { demoStore } from "./demo-store"

// Unified API that works with both Supabase and demo mode
export const api = {
  // Auth
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      try {
        if (isDemoMode) {
          return await demoStore.signIn(email, password)
        }
        return await supabase.auth.signInWithPassword({ email, password })
      } catch (error) {
        console.error("Sign in error:", error)
        return { data: { user: null, session: null }, error: { message: "Authentication failed" } }
      }
    },

    signUp: async ({ email, password }: { email: string; password: string }) => {
      try {
        if (isDemoMode) {
          return await demoStore.signUp(email, password)
        }
        return await supabase.auth.signUp({ email, password })
      } catch (error) {
        console.error("Sign up error:", error)
        return { data: { user: null, session: null }, error: { message: "Registration failed" } }
      }
    },

    getUser: async () => {
      try {
        if (isDemoMode) {
          return await demoStore.getUser()
        }
        return await supabase.auth.getUser()
      } catch (error) {
        console.error("Get user error:", error)
        return { data: { user: null }, error: { message: "Failed to get user" } }
      }
    },

    signOut: async () => {
      try {
        if (isDemoMode) {
          return await demoStore.signOut()
        }
        return await supabase.auth.signOut()
      } catch (error) {
        console.error("Sign out error:", error)
        return { error: { message: "Sign out failed" } }
      }
    },

    onAuthStateChange: (callback: any) => {
      if (isDemoMode) {
        return { data: { subscription: { unsubscribe: () => {} } } }
      }
      return supabase.auth.onAuthStateChange(callback)
    },
  },

  // Permissions
  permissions: {
    getAll: async () => {
      try {
        if (isDemoMode) {
          return await demoStore.getPermissions()
        }
        const { data, error } = await supabase
          .from("permissions")
          .select(`
            *,
            role_permissions(
              roles(id, name)
            )
          `)
          .order("created_at", { ascending: false })
        return { data, error }
      } catch (error) {
        console.error("Get permissions error:", error)
        return { data: [], error: { message: "Failed to fetch permissions" } }
      }
    },

    create: async (name: string, description: string) => {
      try {
        if (isDemoMode) {
          return await demoStore.createPermission(name, description)
        }
        const { data, error } = await supabase.from("permissions").insert([{ name, description }]).select().single()
        return { data, error }
      } catch (error) {
        console.error("Create permission error:", error)
        return { data: null, error: { message: "Failed to create permission" } }
      }
    },

    update: async (id: string, name: string, description: string) => {
      try {
        if (isDemoMode) {
          return await demoStore.updatePermission(id, name, description)
        }
        const { data, error } = await supabase
          .from("permissions")
          .update({ name, description })
          .eq("id", id)
          .select()
          .single()
        return { data, error }
      } catch (error) {
        console.error("Update permission error:", error)
        return { data: null, error: { message: "Failed to update permission" } }
      }
    },

    delete: async (id: string) => {
      try {
        if (isDemoMode) {
          return await demoStore.deletePermission(id)
        }
        return await supabase.from("permissions").delete().eq("id", id)
      } catch (error) {
        console.error("Delete permission error:", error)
        return { data: null, error: { message: "Failed to delete permission" } }
      }
    },

    getByName: async (name: string) => {
      try {
        if (isDemoMode) {
          return await demoStore.getPermissionByName(name)
        }
        return await supabase.from("permissions").select("*").eq("name", name).single()
      } catch (error) {
        console.error("Get permission by name error:", error)
        return { data: null, error: { message: "Permission not found" } }
      }
    },
  },

  // Roles
  roles: {
    getAll: async () => {
      try {
        if (isDemoMode) {
          return await demoStore.getRoles()
        }
        const { data, error } = await supabase
          .from("roles")
          .select(`
            *,
            role_permissions(
              permissions(id, name, description)
            )
          `)
          .order("created_at", { ascending: false })
        return { data, error }
      } catch (error) {
        console.error("Get roles error:", error)
        return { data: [], error: { message: "Failed to fetch roles" } }
      }
    },

    create: async (name: string) => {
      try {
        if (isDemoMode) {
          return await demoStore.createRole(name)
        }
        const { data, error } = await supabase.from("roles").insert([{ name }]).select().single()
        return { data, error }
      } catch (error) {
        console.error("Create role error:", error)
        return { data: null, error: { message: "Failed to create role" } }
      }
    },

    update: async (id: string, name: string) => {
      try {
        if (isDemoMode) {
          return await demoStore.updateRole(id, name)
        }
        const { data, error } = await supabase.from("roles").update({ name }).eq("id", id).select().single()
        return { data, error }
      } catch (error) {
        console.error("Update role error:", error)
        return { data: null, error: { message: "Failed to update role" } }
      }
    },

    delete: async (id: string) => {
      try {
        if (isDemoMode) {
          return await demoStore.deleteRole(id)
        }
        return await supabase.from("roles").delete().eq("id", id)
      } catch (error) {
        console.error("Delete role error:", error)
        return { data: null, error: { message: "Failed to delete role" } }
      }
    },

    getByName: async (name: string) => {
      try {
        if (isDemoMode) {
          return await demoStore.getRoleByName(name)
        }
        return await supabase.from("roles").select("*").eq("name", name).single()
      } catch (error) {
        console.error("Get role by name error:", error)
        return { data: null, error: { message: "Role not found" } }
      }
    },

    updatePermissions: async (roleId: string, permissionIds: string[]) => {
      try {
        if (isDemoMode) {
          return await demoStore.updateRolePermissions(roleId, permissionIds)
        }

        // First, delete existing permissions for this role
        await supabase.from("role_permissions").delete().eq("role_id", roleId)

        // Then, insert new permissions
        if (permissionIds.length > 0) {
          const { error } = await supabase.from("role_permissions").insert(
            permissionIds.map((permissionId) => ({
              role_id: roleId,
              permission_id: permissionId,
            })),
          )
          return { data: null, error }
        }
        return { data: null, error: null }
      } catch (error) {
        console.error("Update role permissions error:", error)
        return { data: null, error: { message: "Failed to update role permissions" } }
      }
    },
  },
}
