# 🗺️ Athena Frontend - Route Map

## Public Routes (No Auth Required)

### Landing & Explore

- **/** - Landing page with hero, features, CTA
- **/explore** - Browse AI agents marketplace
- **/u/:handle** - Public creator profile page
- **/design-system** - Complete component showcase

### Authentication

- **/sign-in** - User sign in (Clerk)
- **/sign-up** - User registration (Clerk)

## Social Feed Routes (Authenticated - All Users)

Social feed with sidebar navigation (similar to OnlyFans/Twitter style)

- **/home** - Social feed with posts from creators
- **/notifications** - User notifications
- **/messages** - Direct messages
- **/collections** - Saved/bookmarked posts
- **/subscriptions** - Manage subscriptions to creators
- **/profile** - Current user profile

## Student Routes (Learning Dashboard)

For all authenticated users to learn from creators.

- **/student/dashboard** - Student overview, stats, recent chats
- **/student/chats** - AI agent conversations
- **/student/payments** - Payment history
- **/student/sessions** - Booked sessions
- **/student/settings** - Account settings

## Creator Routes (Creator Studio)

For verified creators to manage their content.

- **/creator/dashboard** - Creator overview, agent stats, revenue
- **/creator/agents** - Manage AI agents
- **/creator/documents** - Upload knowledge documents
- **/creator/sessions** - Manage session availability
- **/creator/analytics** - Performance metrics
- **/creator/settings** - Creator profile settings
- **/creator/posts/new** - Create new post

## Admin Routes

- **/admin/dashboard** - System admin overview
- **/admin/users** - User management
- **/admin/agents** - Agent moderation
- **/admin/analytics** - Platform analytics
- **/admin/settings** - System settings

---

## 🎯 Navigation Structure

```
┌─────────────────────────────────────────────────────────────┐
│                        ATHENA APP                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Social    │  │   Student   │  │   Creator   │         │
│  │    Feed     │  │  Dashboard  │  │   Studio    │         │
│  │  /home/*    │  │  /student/* │  │  /creator/* │         │
│  │             │  │             │  │             │         │
│  │ • Home      │  │ • Dashboard │  │ • Dashboard │         │
│  │ • Notifs    │  │ • My Chats  │  │ • My Agents │         │
│  │ • Messages  │  │ • Payments  │  │ • Documents │         │
│  │ • Bookmarks │  │ • Sessions  │  │ • Sessions  │         │
│  │ • Subs      │  │ • Settings  │  │ • Analytics │         │
│  │ • Profile   │  │             │  │ • Settings  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  Every user can access Social + Student                     │
│  Only creators can access Creator Studio                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Test Guide

Visit these pages to see the design system in action:

1. **/** - See the landing page layout
2. **/explore** - See the agent browse cards
3. **/home** - See social feed (authenticated)
4. **/student/dashboard** - See student learning dashboard
5. **/creator/dashboard** - See creator studio (creators only)
6. **/design-system** - See ALL components
7. **/admin/dashboard** - See dark admin theme

## 📝 Notes

- Social feed is the default "home" for logged-in users
- Students can learn via `/student/*` routes
- Creators get additional access to `/creator/*` studio
- Each section has quick-links to switch between views
