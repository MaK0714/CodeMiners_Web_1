
Full-stack MERN application structure configured to use **Supabase** for user authentication and user data storage.

---

## 🏗️ Architecture Overview

```
MayureshScrap/
├── client/                     # Frontend (React + Vite + Vanilla CSS)
│   ├── .env.example            # Supabase frontend environment keys template
│   ├── index.html              # HTML entry point with modern typography
│   ├── package.json            # React, Vite, Supabase JS, React Router
│   ├── vite.config.js          # Vite config with /api proxy to Express
│   └── src/
│       ├── assets/             # Images and static assets
│       ├── components/
│       │   ├── auth/           # ProtectedRoute.jsx (guards private views)
│       │   └── common/         # Navbar.jsx, Footer.jsx
│       ├── context/
│       │   └── AuthContext.jsx # Supabase session provider & auth methods
│       ├── hooks/
│       │   └── useAuth.js      # Custom React hook for accessing auth
│       ├── pages/
│       │   ├── HomePage.jsx    # Project landing & status overview
│       │   ├── LoginPage.jsx   # Login page outline (prepared for Step 2)
│       │   ├── RegisterPage.jsx# Registration & profile initialization
│       │   ├── ProfilePage.jsx # Supabase user profile data display/edit
│       │   └── NotFoundPage.jsx# 404 handler
│       ├── services/
│       │   ├── api.js          # Express API client (attaches Supabase JWT)
│       │   └── supabaseClient.js # Supabase JS client initialization
│       ├── App.jsx             # Router and AuthProvider setup
│       ├── index.css           # Design tokens, variables & glassmorphism
│       └── main.jsx            # React root mount
│
├── server/                     # Backend API (Node.js + Express)
│   ├── .env.example            # Backend environment variables template
│   ├── package.json            # Express, cors, dotenv, @supabase/supabase-js
│   └── src/
│       ├── config/
│       │   ├── db.js           # Optional MongoDB connection
│       │   └── supabase.js     # Supabase server & admin client config
│       ├── controllers/
│       │   ├── authController.js   # Session check & profile sync
│       │   ├── scrapController.js  # Scrap domain operations outline
│       │   └── userController.js   # User profile CRUD with Supabase
│       ├── middleware/
│       │   ├── authMiddleware.js   # Supabase JWT token verification
│       │   └── errorHandler.js     # Centralized error handler
│       ├── models/
│       │   └── ScrapItem.js        # Business domain schema outline
│       ├── routes/
│       │   ├── authRoutes.js       # /api/auth routes
│       │   ├── scrapRoutes.js      # /api/scrap routes
│       │   └── userRoutes.js       # /api/users routes
│       └── server.js           # Express app setup, CORS, route registration
│
├── supabase/                   # Supabase Database Configuration
│   ├── README.md               # Step-by-step setup guide for Supabase
│   └── schema.sql              # Profiles table, RLS policies, & signup trigger
│
├── .gitignore
├── package.json                # Monorepo scripts (run client & server)
└── README.md
```

---

## 🔐 Supabase Integration Details

### 1. Authentication
- User sign-ups and logins are handled directly through Supabase Auth via `@supabase/supabase-js`.
- The frontend [`client/src/context/AuthContext.jsx`](file:///c:/Users/Aditya/Documents/MayureshScrap/client/src/context/AuthContext.jsx) manages the persistent auth session and listens to `onAuthStateChange`.

### 2. User Data Storing
- When a user signs up, a PostgreSQL trigger defined in [`supabase/schema.sql`](file:///c:/Users/Aditya/Documents/MayureshScrap/supabase/schema.sql) automatically inserts a record into `public.profiles` with the user's UUID (`id`), metadata, and default role.
- Row Level Security (RLS) is enabled so users can only read and modify their own profile data.
- The Express backend [`server/src/middleware/authMiddleware.js`](file:///c:/Users/Aditya/Documents/MayureshScrap/server/src/middleware/authMiddleware.js) verifies incoming `Bearer` JWT tokens with Supabase, validating user identity on protected API routes.

---

## 🚀 Quick Setup Instructions

### 1. Database Setup
1. Create a project on [Supabase](https://supabase.com).
2. Open the **SQL Editor** in Supabase and run [`supabase/schema.sql`](file:///c:/Users/Aditya/Documents/MayureshScrap/supabase/schema.sql).
3. Copy your **Project URL**, **anon/public key**, and **service_role secret key** from **Project Settings -> API**.

### 2. Configure Environment Files
- Copy `client/.env.example` to `client/.env` and insert your Supabase URL & Anon Key.
- Copy `server/.env.example` to `server/.env` and insert your Supabase credentials and desired Port.

### 3. Install Dependencies
```bash
# Install root, client, and server dependencies
npm run install:all
```

### 4. Running the Development Servers
```bash
# Run both client and server concurrently:
npm run dev

# Or run separately:
npm run client   # Starts Vite React dev server at http://localhost:5173
npm run server   # Starts Express API at http://localhost:5000
```

---

## 🎯 Next Step
As requested, this completes **Step 1 (Folder structure, architecture outline, and Supabase integration setup)**.
Next, we can plan and implement the **Login and Authentication flow** in detail.
