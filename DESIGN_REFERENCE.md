# Design System Quick Reference

## 🎨 Color Usage Guide

### When to Use Each Color

**Purple (`brand-purple-600`)** - Primary Actions

- Main CTA buttons
- Active navigation items
- Primary links and highlights
- Important badges/labels

**Teal (`brand-teal-400`)** - Secondary Actions

- Secondary buttons
- Supporting badges
- Accent highlights
- Success states

**Grays** - Structure & Content

- `gray-900` - Primary text
- `gray-700` - Secondary text
- `gray-600` - Supporting text
- `gray-500` - Placeholder text
- `border-light` (#e5e5e5) - Borders

**Backgrounds**

- `background-light` (#fafafa) - Page background
- `background-card` (#ffffff) - Card background

### Color Combinations

✅ **Good**

```tsx
// Purple on white
<button className="bg-brand-purple-600 text-white">

// Teal on white (secondary action)
<button className="bg-brand-teal-400 text-white">

// Purple outline
<button className="border-brand-purple-600 text-brand-purple-600">

// Subtle highlight
<div className="bg-brand-purple-50 text-brand-purple-700">
```

❌ **Avoid**

- Purple + Teal together (unless gradient for special CTA)
- Multiple bright colors in same component
- Gradients everywhere

## 🔤 Typography Scale

```tsx
<h1 className="heading-1">Page Title (40px)</h1>
<h2 className="heading-2">Section Header (28px)</h2>
<h3 className="heading-3">Card Title (20px)</h3>
<p className="body-text">Main content (16px)</p>
<p className="small-text">Supporting info (14px)</p>
<p className="text-xs">Tiny text (12px)</p>
```

### When to Use Each

- **H1**: Page title, one per page
- **H2**: Major section dividers
- **H3**: Card headings, subsections
- **Body**: Paragraphs, descriptions
- **Small**: Captions, meta info
- **XS**: Timestamps, badges

## 📦 Component Patterns

### Cards

```tsx
// Basic card
<div className="card">
  <h3 className="heading-3 mb-2">Title</h3>
  <p className="body-text">Content</p>
</div>

// Interactive card
<div className="card-hover cursor-pointer">
  {/* ... */}
</div>

// Highlighted card
<div className="card border-2 border-brand-purple-300 bg-brand-purple-50">
  {/* ... */}
</div>
```

### Buttons

```tsx
// Primary action
<button className="btn-primary">Save Changes</button>

// Secondary action
<button className="btn-secondary">Learn More</button>

// Outline (less important)
<button className="btn-outline">Cancel</button>

// Ghost (minimal)
<button className="btn-ghost">Skip</button>

// Sizes
<button className="btn-primary text-sm px-3 py-1.5">Small</button>
<button className="btn-primary">Medium (default)</button>
<button className="btn-primary text-lg px-6 py-3">Large</button>
```

### Forms

```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
  <input type="text" placeholder="Placeholder..." className="input" />
</div>
```

### Stats Cards

```tsx
<div className="card">
  <div className="flex items-center justify-between mb-2">
    <span className="small-text text-gray-600">Label</span>
    <span className="text-2xl">🎯</span>
  </div>
  <p className="text-3xl font-bold text-brand-purple-600">1,234</p>
  <p className="text-xs text-gray-500 mt-1">+12% this week</p>
</div>
```

## 📐 Spacing Guidelines

### Container Padding

```tsx
// Page container
<div className="max-w-7xl mx-auto px-6 py-12">

// Section padding
<section className="py-16">

// Card padding
<div className="card">  {/* Already has p-6 */}
```

### Element Spacing

```tsx
// Vertical spacing between sections
<div className="mb-8">  // Medium gap
<div className="mb-16"> // Large gap

// Horizontal gaps in flex/grid
<div className="flex gap-4">
<div className="grid gap-6">

// Stacked content
<div className="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

## 🎭 Icon Usage

Currently using emojis (clean, simple):

```tsx
🎯 - Goals, targets, focus
💬 - Chat, messages
🤖 - AI agents, bots
📊 - Dashboard, analytics
📄 - Documents, files
📅 - Calendar, sessions
⚙️ - Settings
👥 - Users, community
📈 - Growth, trends
✨ - New, special features
✅ - Success, completed
🔒 - Security, locked
💰 - Money, revenue
⏱️ - Time, duration
```

### Icon Sizing

```tsx
<span className="text-lg">🤖</span>   // 18px - in nav
<span className="text-xl">🤖</span>   // 20px - in content
<span className="text-2xl">🤖</span>  // 24px - stats cards
<span className="text-3xl">🤖</span>  // 30px - large icons
```

## 🎨 Layout Patterns

### Grid Layouts

```tsx
// 2 columns
<div className="grid md:grid-cols-2 gap-6">

// 3 columns
<div className="grid md:grid-cols-3 gap-6">

// 4 columns (stats)
<div className="grid md:grid-cols-4 gap-6">
```

### Flex Layouts

```tsx
// Space between
<div className="flex items-center justify-between">

// Centered
<div className="flex items-center justify-center">

// With gap
<div className="flex items-center gap-4">
```

## 🎯 Common Component Recipes

### List Item (Clickable)

```tsx
<div className="p-4 rounded-xl border border-border-light hover:border-brand-purple-300 transition-colors cursor-pointer">
  <div className="flex items-start justify-between">
    <div>
      <h3 className="font-semibold text-gray-900 mb-1">Title</h3>
      <p className="small-text text-gray-600">Description</p>
    </div>
    <span className="text-xs text-gray-500">Time</span>
  </div>
</div>
```

### User Avatar

```tsx
<div className="w-8 h-8 rounded-full bg-brand-purple-100 flex items-center justify-center">
  <span className="text-sm font-medium text-brand-purple-700">{initials}</span>
</div>
```

### Badge

```tsx
<span className="text-xs font-semibold text-brand-teal-600 bg-brand-teal-50 px-2 py-0.5 rounded">
  Active
</span>
```

### Activity Dot

```tsx
<div className="w-2 h-2 rounded-full bg-brand-teal-400"></div>
```

## ✨ Animation Guidelines

When adding animations with framer-motion:

1. **Subtle by default** - Don't overdo it
2. **Fast transitions** - 200ms for most interactions
3. **Smooth easing** - Use ease-in-out
4. **Page transitions** - Fade + slight slide
5. **Button interactions** - Scale on active (`active:scale-95`)

## 📱 Responsive Breakpoints

```tsx
// Mobile first
<div className="block md:flex">

// Tailwind breakpoints:
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

## 🎨 Design Don'ts

❌ **Never do this:**

- Neon gradients everywhere
- Glassmorphism effects
- Multiple competing gradients
- Tiny text (< 12px)
- Low contrast text
- Overuse of animations
- ChatGPT clone aesthetics

✅ **Always do this:**

- Clean, minimal
- Generous whitespace
- Consistent spacing
- Clear hierarchy
- Professional colors
- Purposeful accents
