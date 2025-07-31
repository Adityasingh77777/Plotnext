export interface Permission {
  id: string
  name: string
  description?: string
  created_at: string
  role_permissions?: {
    roles: {
      id: string
      name: string
    }
  }[]
}

export interface Role {
  id: string
  name: string
  created_at: string
  role_permissions?: {
    permissions: {
      id: string
      name: string
      description?: string
    }
  }[]
}

export interface RolePermission {
  role_id: string
  permission_id: string
}

export interface UserRole {
  user_id: string
  role_id: string
}
