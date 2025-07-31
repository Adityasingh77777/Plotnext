# Permissions & Roles Configurator

A comprehensive full-stack RBAC (Role-Based Access Control) management system built with Next.js 14, Supabase, and modern web technologies.

## 🚀 Live Demo

**Live URL:** [https://your-app-name.vercel.app](https://your-app-name.vercel.app)

## 📋 What is RBAC?

RBAC is like giving keys to rooms. Each role has keys (permissions) to open certain doors. A viewer can open only the reading room, an editor can open the writing room too, and an admin has keys to all doors.

## ✨ Features

- **🔐 Secure Authentication**: Email/password authentication with Supabase Auth
- **👥 Role Management**: Create, edit, and delete user roles
- **🔑 Permission Management**: Manage system permissions with descriptions
- **🔗 Many-to-Many Relationships**: Link roles and permissions with intuitive UI
- **🗣️ Natural Language Processing**: Use plain English to manage roles and permissions
- **📱 Responsive Design**: Works perfectly on desktop and mobile devices
- **🎨 Modern UI**: Built with Shadcn/UI components and Tailwind CSS
- **⚡ Real-time Updates**: Instant UI updates with React Query
- **🛡️ Row Level Security**: Secure data access with Supabase RLS

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, React
- **Backend**: Supabase (Database, Auth, API)
- **UI Components**: Shadcn/UI
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Deployment**: Vercel

## 📊 Database Schema

\`\`\`sql
-- Permissions table
permissions (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Roles table
roles (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Junction table for many-to-many relationship
role_permissions (
  role_id UUID REFERENCES roles(id),
  permission_id UUID REFERENCES permissions(id),
  PRIMARY KEY (role_id, permission_id)
)

-- User roles assignment
user_roles (
  user_id UUID REFERENCES auth.users(id),
  role_id UUID REFERENCES roles(id),
  PRIMARY KEY (user_id, role_id)
)
\`\`\`

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- Git

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/yourusername/permissions-roles-configurator.git
cd permissions-roles-configurator
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy \`.env.example\` to \`.env.local\`:

\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Update \`.env.local\` with your Supabase credentials:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

### 4. Set Up Database

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of \`scripts/database-setup.sql\`
3. Run the script to create tables and sample data

### 5. Create Test User

1. In Supabase dashboard, go to Authentication > Users
2. Click "Add user" and create:
   - Email: \`admin@test.com\`
   - Password: \`password123\`
   - Confirm the user (toggle "Email confirmed")

### 6. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Login and Explore

Use the test credentials:
- **Email**: admin@test.com
- **Password**: password123

## 🎯 Usage Guide

### Managing Permissions

1. Navigate to the **Permissions** tab
2. Click "Add Permission" to create new permissions
3. Edit or delete existing permissions using the action buttons
4. View which roles are assigned to each permission

### Managing Roles

1. Go to the **Roles** tab
2. Create new roles with the "Add Role" button
3. Click the settings icon to assign permissions to roles
4. Use checkboxes to select/deselect permissions for each role

### Natural Language Commands

Use the **Natural Language** tab to manage roles and permissions with plain English:

**Example Commands:**
- "Create a new permission called 'publish content'"
- "Give the role 'Content Editor' the permission to 'edit articles'"
- "Create a role called 'Moderator'"
- "Remove the permission 'delete posts' from role 'Editor'"

## 🚀 Deployment to Vercel

### Option 1: Deploy Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/permissions-roles-configurator)

### Option 2: Manual Deployment

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard:
   - \`NEXT_PUBLIC_SUPABASE_URL\`
   - \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
4. Deploy!

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| \`NEXT_PUBLIC_SUPABASE_URL\` | Your Supabase project URL | Yes |
| \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` | Your Supabase anonymous key | Yes |

### Supabase Setup

1. **Enable Row Level Security** on all tables
2. **Create policies** for authenticated users
3. **Set up authentication** with email/password provider
4. **Run the database setup script** to create tables and sample data

## 🧪 Testing

The application includes sample data for testing:

**Sample Roles:**
- Viewer (read_articles, view_analytics)
- Content Editor (read_articles, edit_articles, view_analytics)
- Publisher (read_articles, edit_articles, publish_content, view_analytics)
- Administrator (all permissions)

**Sample Permissions:**
- read_articles
- edit_articles
- delete_articles
- publish_content
- manage_users
- view_analytics
- manage_settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature/amazing-feature\`
3. Commit your changes: \`git commit -m 'Add amazing feature'\`
4. Push to the branch: \`git push origin feature/amazing-feature\`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/yourusername/permissions-roles-configurator/issues) page
2. Create a new issue with detailed information
3. Join our [Discord community](https://discord.gg/your-invite) for help

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Shadcn/UI](https://ui.shadcn.com/) for the beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first styling
- [TanStack Query](https://tanstack.com/query) for data fetching and caching

---

**Built with ❤️ by [Your Name](https://github.com/yourusername)**
