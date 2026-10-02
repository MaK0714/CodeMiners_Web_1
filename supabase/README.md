# Supabase Configuration Guide

This project uses **Supabase** for:
1. **User Authentication** (Email/Password, Magic Link, OAuth, JWT tokens)
2. **User Data Storage** (`profiles` table linked with Row Level Security)

---

## Setup Steps

### 1. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create or log in to your account.
2. Click **"New Project"** and name it (e.g., `mayuresh-scrap`).
3. Choose your database password and nearest region.

### 2. Run the SQL Schema
1. In your Supabase Dashboard, go to the **SQL Editor** tab on the left sidebar.
2. Click **"New query"**.
3. Copy and paste the contents of [`schema.sql`](./schema.sql).
4. Click **Run**. This will:
   - Create the `public.profiles` table linked to `auth.users`.
   - Enable Row Level Security (RLS).
   - Set up automatic triggers so every newly registered user gets a profile record automatically.

### 3. Retrieve Your API Keys
1. In the Supabase Dashboard, navigate to **Project Settings** -> **API**.
2. Note down:
   - **Project URL** (`https://xyzcompany.supabase.co`)
   - **anon / public key** (safe for frontend `client/.env`)
   - **service_role key** (secret key for `server/.env`, bypasses RLS for administrative verification)

### 4. Configure Environment Variables
- In `client/.env`:
  ```env
  VITE_SUPABASE_URL=https://your-project-id.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-public-key
  VITE_API_BASE_URL=http://localhost:5000/api
  ```
- In `server/.env`:
  ```env
  PORT=5000
  SUPABASE_URL=https://your-project-id.supabase.co
  SUPABASE_ANON_KEY=your-anon-public-key
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  CLIENT_URL=http://localhost:5173
  ```
