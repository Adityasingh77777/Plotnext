-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- Insert sample permissions
INSERT INTO permissions (name, description) VALUES
  ('read_articles', 'Can view and read articles'),
  ('edit_articles', 'Can create and edit articles'),
  ('delete_articles', 'Can delete articles'),
  ('publish_content', 'Can publish content to live site'),
  ('manage_users', 'Can create, edit, and delete user accounts'),
  ('view_analytics', 'Can view site analytics and reports'),
  ('manage_settings', 'Can modify system settings'),
  ('moderate_comments', 'Can moderate user comments'),
  ('manage_categories', 'Can create and manage content categories'),
  ('export_data', 'Can export system data')
ON CONFLICT (name) DO NOTHING;

-- Insert sample roles
INSERT INTO roles (name) VALUES
  ('Viewer'),
  ('Content Editor'),
  ('Publisher'),
  ('Moderator'),
  ('Administrator'),
  ('Super Admin')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
WITH role_permission_assignments AS (
  SELECT 
      r.id as role_id,
      p.id as permission_id
  FROM roles r
  CROSS JOIN permissions p
  WHERE 
      (r.name = 'Viewer' AND p.name IN ('read_articles', 'view_analytics')) OR
      (r.name = 'Content Editor' AND p.name IN ('read_articles', 'edit_articles', 'view_analytics', 'manage_categories')) OR
      (r.name = 'Publisher' AND p.name IN ('read_articles', 'edit_articles', 'publish_content', 'view_analytics', 'manage_categories')) OR
      (r.name = 'Moderator' AND p.name IN ('read_articles', 'moderate_comments', 'view_analytics')) OR
      (r.name = 'Administrator' AND p.name IN ('read_articles', 'edit_articles', 'delete_articles', 'publish_content', 'manage_users', 'view_analytics', 'manage_settings', 'moderate_comments', 'manage_categories', 'export_data')) OR
      (r.name = 'Super Admin' AND p.name IN ('read_articles', 'edit_articles', 'delete_articles', 'publish_content', 'manage_users', 'view_analytics', 'manage_settings', 'moderate_comments', 'manage_categories', 'export_data'))
)
INSERT INTO role_permissions (role_id, permission_id)
SELECT role_id, permission_id FROM role_permission_assignments
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for permissions table
DROP POLICY IF EXISTS "Allow authenticated users to read permissions" ON permissions;
DROP POLICY IF EXISTS "Allow authenticated users to manage permissions" ON permissions;
CREATE POLICY "Allow authenticated users to select permissions" ON permissions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert permissions" ON permissions
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update permissions" ON permissions
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users to delete permissions" ON permissions
  FOR DELETE TO authenticated USING (true);

-- Create policies for roles table
DROP POLICY IF EXISTS "Allow authenticated users to read roles" ON roles;
DROP POLICY IF EXISTS "Allow authenticated users to manage roles" ON roles;
CREATE POLICY "Allow authenticated users to select roles" ON roles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert roles" ON roles
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update roles" ON roles
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users to delete roles" ON roles
  FOR DELETE TO authenticated USING (true);

-- Create policies for role_permissions table
DROP POLICY IF EXISTS "Allow authenticated users to read role_permissions" ON role_permissions;
DROP POLICY IF EXISTS "Allow authenticated users to manage role_permissions" ON role_permissions;
CREATE POLICY "Allow authenticated users to select role_permissions" ON role_permissions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert role_permissions" ON role_permissions
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to delete role_permissions" ON role_permissions
  FOR DELETE TO authenticated USING (true);

-- Create policies for user_roles table
DROP POLICY IF EXISTS "Allow authenticated users to read user_roles" ON user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to manage user_roles" ON user_roles;
CREATE POLICY "Allow authenticated users to select user_roles" ON user_roles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert user_roles" ON user_roles
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to delete user_roles" ON user_roles
  FOR DELETE TO authenticated USING (true);
