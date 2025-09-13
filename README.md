# Linux Club Admin Panel

A comprehensive admin panel for managing recruitment applications with role-based access control and Google OAuth authentication.

## Features

- **Google OAuth Authentication**: Secure login with Google accounts
- **Role-Based Access Control**: Only users with "panelist" role can access the admin panel
- **Department Management**: View applicants by department (tech, content, media, management)
- **Search & Filter**: Advanced filtering by status and search functionality
- **Individual Applicant Views**: Detailed view of each applicant's responses
- **Bulk Actions**: Shortlist or reject multiple applicants at once
- **Real-time Updates**: Live status updates with Supabase integration

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Authentication, Row Level Security)
- **Deployment**: Vercel with GitHub Actions

## Setup Instructions

### 1. Database Setup

Run the SQL scripts in order:
1. `scripts/001_create_tables.sql` - Creates the database schema
2. `scripts/002_seed_sample_data.sql` - Adds sample applicant data

### 2. Supabase Configuration

1. Enable Google OAuth in Supabase Auth settings
2. Add your domain to the allowed redirect URLs: `https://anumeya.com/lug-recruitment/auth/callback`
3. Set up Row Level Security policies (included in the SQL scripts)

### 3. Environment Variables

Required environment variables (automatically configured in v0):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 4. User Role Assignment

To grant admin access, update a user's role in the database:
\`\`\`sql
UPDATE public.users SET role = 'panelist' WHERE email = 'admin@example.com';
\`\`\`

## Deployment

The project includes GitHub Actions for automatic deployment to Vercel. Set up the following secrets in your GitHub repository:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Usage Flow

1. **Login**: Users authenticate with Google OAuth
2. **Role Check**: System verifies user has "panelist" role
3. **Department Selection**: Choose which department to review
4. **Applicant Management**: View, search, filter, and manage applicants
5. **Individual Review**: View detailed applicant responses
6. **Actions**: Shortlist, reject, or reset applicant status

## Security Features

- Row Level Security (RLS) on all database tables
- Role-based access control
- Secure authentication with Supabase
- Protected routes with middleware
- HTTPS enforcement
- Security headers configuration

## Dark Theme

The application uses a dark theme with black background and yellow highlights for better visibility during long review sessions.
