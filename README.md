# Athena Frontend - Phase 0 Complete ✅

A modern, clean Next.js application with professional design - **not** generic AI gradient trash.

## 🎨 Design Philosophy

**Think: Notion × Figma × Stripe**

- **Clean & Minimal**: Off-white backgrounds, subtle borders, generous whitespace
- **Purposeful Color**: Deep purple (#9333ea) + Electric teal (#2dd4bf)
- **Card-Based Layouts**: Rounded-2xl corners, subtle shadows
- **Typography Hierarchy**: Clear, professional type scale

## 🚀 What's Built

### ✅ Project Setup

- Next.js 15 with TypeScript, Tailwind CSS, App Router
- Dependencies installed:
  - `@tanstack/react-query` - Server state management
  - `axios` - HTTP client
  - `framer-motion` - Animations (ready to use)
  - `zustand` - Client state management
  - `@clerk/nextjs` - Authentication (configured)
  - `tailwind-merge` + `clsx` - Utility class helpers

### ✅ Layouts & Routes

#### Public Routes (`(public)/`)

- **Landing Page** (`/`) - Hero, features, CTA
- **Explore** (`/explore`) - Browse AI agents
- Clean navbar with Home, Explore, Sign In/Up

#### Auth Routes (`(auth)/`)

- **Sign In** (`/sign-in`)
- **Sign Up** (`/sign-up`)
- Centered layout with gradient background

#### Student Dashboard (`/student/`)

- Sidebar navigation: Dashboard, My Chats, Sessions, Settings
- Dashboard with stats and recent activity
- Route: `/student/dashboard`

#### Creator Dashboard (`/creator/`)

- Sidebar navigation: Dashboard, Agents, Documents, Sessions, Analytics
- Creator-specific stats and agent management
- Route: `/creator/dashboard`

#### Admin Dashboard (`/admin/`)

- Dark sidebar with system overview
- Admin controls for users, agents, analytics
- Route: `/admin/dashboard`

### ✅ Design System (`/design-system`)

Complete component showcase including:

- **Color Palette**: Purple & Teal gradients
- **Typography**: H1 (40px), H2 (28px), H3 (20px), Body (16px)
- **Buttons**: Primary, Secondary, Outline, Ghost
- **Cards**: Basic, Hoverable, Gradient, Highlighted
- **Forms**: Inputs, Textareas, Checkboxes
- **Spacing Guidelines**: Consistent whitespace patterns

## 🎯 Key Files

```
AthenaFront/
├── app/
│   ├── layout.tsx                  # Root layout with providers
│   ├── globals.css                 # Global styles + component classes
│   ├── (public)/
│   │   ├── layout.tsx              # Public navbar + footer
│   │   ├── page.tsx                # Landing page
│   │   └── explore/page.tsx        # Browse agents
│   ├── (auth)/
│   │   ├── layout.tsx              # Auth centered layout
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   ├── student/
│   │   ├── layout.tsx              # Student sidebar
│   │   └── dashboard/page.tsx
│   ├── creator/
│   │   ├── layout.tsx              # Creator sidebar
│   │   └── dashboard/page.tsx
│   ├── admin/
│   │   ├── layout.tsx              # Admin dark sidebar
│   │   └── dashboard/page.tsx
│   └── design-system/page.tsx      # Component showcase
├── lib/
│   ├── providers.tsx               # QueryClient + Clerk providers
│   └── utils.ts                    # cn() utility
└── tailwind.config.ts              # Design tokens + theme
```

## 🎨 Design Tokens

### Colors

```css
--brand-purple-600: #9333ea    /* Primary actions */
--brand-teal-400: #2dd4bf      /* Secondary/accents */
--background-light: #fafafa    /* Off-white base */
--background-card: #ffffff     /* Card backgrounds */
```

### Typography

- **H1**: 40px, Bold - Page titles
- **H2**: 28px, Semibold - Section headers
- **H3**: 20px, Semibold - Card titles
- **Body**: 16px, Regular - Main content
- **Small**: 14px, Regular - Supporting text

### Spacing

- Card padding: `p-6` (24px)
- Section spacing: `mb-8` or `mb-16`
- Element gaps: `gap-3`, `gap-4`, `gap-6`
- Rounded corners: `rounded-2xl` (16px)

## 🚀 Running the App

```bash
npm run dev
```

Visit:

- Landing: http://localhost:3000
- Explore: http://localhost:3000/explore
- Design System: http://localhost:3000/design-system
- Student Dashboard: http://localhost:3000/student/dashboard
- Creator Dashboard: http://localhost:3000/creator/dashboard
- Admin Dashboard: http://localhost:3000/admin/dashboard

## 📝 Reusable CSS Classes

Defined in `globals.css`:

```css
/* Cards */
.card              /* Basic card */
/* Basic card */
.card-hover        /* Interactive card with hover effect */

/* Buttons */
.btn-primary       /* Purple primary button */
.btn-secondary     /* Teal secondary button */
.btn-outline       /* Outlined purple button */
.btn-ghost         /* Transparent hover button */

/* Forms */
.input             /* Text input with focus ring */

/* Typography */
.heading-1         /* 40px bold heading */
.heading-2         /* 28px semibold heading */
.heading-3         /* 20px semibold heading */
.body-text         /* 16px body text */
.small-text; /* 14px supporting text */
```

## 🔧 Utilities

### `cn()` Helper

```tsx
import { cn } from "@/lib/utils";

<div className={cn("base-class", isActive && "active-class")} />;
```

## 🎯 Next Steps (Phase 1+)

1. **API Integration**: Connect to AthenaCore backend
2. **Clerk Setup**: Configure real authentication
3. **Real Data**: Replace mock data with API calls
4. **Animations**: Add framer-motion transitions
5. **State Management**: Implement zustand stores

## ✨ Design Highlights

- ✅ No generic AI gradients
- ✅ Clean, minimal aesthetic
- ✅ Professional color palette
- ✅ Consistent spacing and typography
- ✅ Card-based layouts with whitespace
- ✅ Reusable component system
- ✅ Dark mode ready (admin layout example)

---

**Built with**: Next.js 15, TypeScript, Tailwind CSS, Clerk, React Query

**Design Inspiration**: Notion, Figma, Stripe
