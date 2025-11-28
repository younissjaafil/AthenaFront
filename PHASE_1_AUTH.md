# Phase 1: Authentication & Role-Based Routing

This document explains the authentication and role-based routing implementation for AthenaFront.

## Overview

Phase 1 implements full authentication using Clerk and role-based routing that integrates with the AthenaCore backend. Users sign in with Clerk, and the frontend determines their role (Admin, Creator, or Student) by calling AthenaCore's REST API.

## Architecture

### Authentication Flow

1. **Sign In/Sign Up**: Users authenticate via Clerk components (`/sign-in`, `/sign-up`)
2. **JWT Token**: Clerk issues a JWT token upon successful authentication
3. **API Integration**: Frontend attaches the JWT token to all AthenaCore API requests
4. **Role Detection**: Frontend calls backend endpoints to determine user roles
5. **Route Protection**: Users are redirected to their appropriate dashboard

### Role Hierarchy

- **Admin**: Full access to `/admin/*`, `/creator/*`, and `/student/*`
- **Creator**: Access to `/creator/*` and `/student/*`
- **Student**: Access only to `/student/*`

## Implementation Details

### 1. Clerk Integration

**Files Modified:**

- `lib/providers.tsx` - Activated `ClerkProvider`
- `middleware.ts` - Created Clerk middleware for route protection
- `app/(auth)/sign-in/[[...sign-in]]/page.tsx` - Clerk `<SignIn />` with catch-all routing
- `app/(auth)/sign-up/[[...sign-up]]/page.tsx` - Clerk `<SignUp />` with catch-all routing

> **Note:** Clerk components require catch-all routes (`[[...sign-in]]`, `[[...sign-up]]`) to handle their internal navigation and OAuth callbacks properly.

**Environment Variables:**

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/student/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/student/dashboard
```

**Public Routes** (accessible without authentication):

- `/` - Home page
- `/explore` - Explore agents
- `/sign-in` - Sign in page
- `/sign-up` - Sign up page

All other routes require authentication.

### 2. API Client

**File:** `lib/api-client.ts`

Client-side API client that automatically attaches Clerk JWT tokens to requests:

```typescript
import { useAuth } from "@clerk/nextjs";

const { getToken } = useAuth();
const apiClient = createClientApiClient(getToken);

// All requests now include: Authorization: Bearer <token>
const response = await apiClient.get("/users/me");
```

### 3. User Role Hook

**File:** `hooks/useCurrentUser.ts`

React Query hook that fetches user information and determines roles:

```typescript
const { data: user, isLoading } = useCurrentUser();

// user contains:
// - id, email, firstName, lastName (from /users/me)
// - isAdmin (from user.isAdmin flag in backend)
// - isCreator (from /creators/me - 404 = false)
// - isStudent (derived: !isAdmin && !isCreator)
// - creatorId (if isCreator is true)
```

**Backend API Calls:**

1. `GET /users/me` - Returns user info with `isAdmin` flag
2. `GET /creators/me` - Returns creator info (404 if not a creator)

**Role Derivation Logic:**

```typescript
isAdmin = user.isAdmin === true
isCreator = /creators/me responds successfully
isStudent = !isAdmin && !isCreator
```

### 4. Route Guards

**File:** `components/auth/RoleRedirector.tsx`

Provides two components for route protection:

#### `RoleGuard`

Higher-order component that protects routes by role:

```typescript
<RoleGuard allowedRoles={["admin"]}>
  {/* Only admins can access this */}
</RoleGuard>
```

**Usage in Layouts:**

- `app/admin/layout.tsx` - `allowedRoles={["admin"]}`
- `app/creator/layout.tsx` - `allowedRoles={["creator", "admin"]}`
- `app/student/layout.tsx` - `allowedRoles={["student", "creator", "admin"]}`

If a user tries to access a route they don't have permission for, they're automatically redirected to their correct dashboard.

#### `RoleRedirector`

Component that redirects users to their appropriate dashboard:

```typescript
<RoleRedirector />
```

Redirect priority: Admin → Creator → Student

### 5. Protected Layouts

All role-specific layouts now include `RoleGuard`:

**Admin Layout** (`app/admin/layout.tsx`):

- Only users with `isAdmin === true` can access
- Unauthorized users redirected to their dashboard

**Creator Layout** (`app/creator/layout.tsx`):

- Users with `isCreator === true` or `isAdmin === true` can access
- Students are redirected to `/student/dashboard`

**Student Layout** (`app/student/layout.tsx`):

- All authenticated users can access
- Admins/creators accessing student routes see student view

## User Flow Examples

### New User Sign Up

1. Navigate to `/sign-up`
2. Complete Clerk sign-up form
3. Backend webhook creates user record with default `isAdmin = false`
4. Frontend calls `/users/me`, `/creators/me` (both return 404 for creator check)
5. User flagged as `isStudent = true`
6. Redirected to `/student/dashboard`

### Creator Access

1. Admin manually promotes user to creator in backend
2. User signs in via `/sign-in`
3. Frontend calls `/users/me` (returns user with `isAdmin = false`)
4. Frontend calls `/creators/me` (returns creator record)
5. User flagged as `isCreator = true`, `isStudent = false`
6. Redirected to `/creator/dashboard`

### Admin Access

1. Admin flag set in database (`isAdmin = true`)
2. User signs in via `/sign-in`
3. Frontend calls `/users/me` (returns user with `isAdmin = true`)
4. User flagged as `isAdmin = true`
5. Redirected to `/admin/dashboard`
6. Admin has access to all routes

## Testing

### Local Development

1. Start the backend: `cd AthenaCore && npm run start:dev`
2. Start the frontend: `cd AthenaFront && npm run dev`
3. Navigate to `http://localhost:3000`

### Test Different Roles

**Student:**

- Sign up as new user
- Should redirect to `/student/dashboard`
- Cannot access `/creator/*` or `/admin/*`

**Creator:**

- Manually add creator record in backend for user
- Sign in
- Should redirect to `/creator/dashboard`
- Can access `/creator/*` and `/student/*`
- Cannot access `/admin/*`

**Admin:**

- Set `isAdmin = true` in database for user
- Sign in
- Should redirect to `/admin/dashboard`
- Can access all routes

## Troubleshooting

### "401 Unauthorized" from Backend

**Cause:** JWT token not being sent or invalid

**Solution:**

1. Check Clerk is properly configured
2. Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is correct
3. Check that backend webhook created user record

### Stuck on Loading Screen

**Cause:** API calls to backend failing

**Solution:**

1. Verify `NEXT_PUBLIC_ATHENA_CORE_URL` points to running backend
2. Check browser console for API errors
3. Ensure backend endpoints `/users/me`, `/creators/me` are working

### Wrong Dashboard After Sign In

**Cause:** Role detection logic error

**Solution:**

1. Check backend response for `/users/me` - should have `isAdmin` field
2. Check `/creators/me` endpoint - 404 is expected for non-creators
3. Review `useCurrentUser` hook logic

## Next Steps (Phase 2+)

- [ ] Implement actual dashboard content for each role
- [ ] Add user profile management
- [ ] Implement agent creation flow (creators)
- [ ] Build chat interface (students)
- [ ] Add analytics dashboards
- [ ] Implement document management
- [ ] Add session scheduling
- [ ] Build admin user management

## Backend Integration Checklist

✅ Clerk webhook creates user on sign-up
✅ `/users/me` returns user with `isAdmin` flag
✅ `/creators/me` returns creator info or 404
✅ Backend validates Clerk JWT tokens
✅ CORS configured to allow frontend origin
