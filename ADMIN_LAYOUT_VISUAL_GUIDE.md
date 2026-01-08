# 🎨 ADMIN LAYOUT - VISUAL GUIDE

## 📐 Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                       BROWSER WINDOW                            │
│┌───────────────────────────────────────────────────────────────┐│
││  AdminGuard (Security Wrapper)                                ││
││  ┌────────────┬──────────────────────────────────────────────┐││
││  │            │ AdminHeader                                   │││
││  │            │ ┌─────────┬────────────────────────────────┐ │││
││  │ AdminSidebar│ ☰ Toggle│  User Info & Avatar ▼        │ │││
││  │            │ └─────────┴────────────────────────────────┘ │││
││  │ ┌────────┐ │                                               │││
││  │ │   TF   │ │ Content Area (#fff)                          │││
││  │ └────────┘ │ ┌───────────────────────────────────────────┐│││
││  │            │ │                                           ││││
││  │ ├─ 📊 Dash│ │ {children}                                ││││
││  │ ├─ 📅 Event│ │ Page content renders here                ││││
││  │ ├─ 📈 Report│ │                                          ││││
││  │ ────────── │ │                                           ││││
││  │ └─ 🏠 Home │ │                                           ││││
││  │            │ └───────────────────────────────────────────┘│││
││  └────────────┴──────────────────────────────────────────────┘││
││  Background: #f5f5f5 (Light Gray)                             ││
│└───────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## 🖥️ Desktop View (>= 1024px)

### Sidebar Expanded (250px)
```
┌────────────────────────────────────────────────────────────┐
│  Sidebar (250px)    │  Content Area                        │
│  ┌──────────────┐   │  ┌──────────────────────────────┐   │
│  │ TicketFlow   │   │  │ ☰   User Info & Avatar ▼   │   │
│  │    Admin     │   │  └──────────────────────────────┘   │
│  └──────────────┘   │                                      │
│                     │  Main Content                        │
│  📊 Dashboard       │  ┌──────────────────────────────┐   │
│  📅 My Events       │  │                              │   │
│  📈 Reports         │  │  Page renders here          │   │
│  ──────────────     │  │                              │   │
│  🏠 Back to Home    │  │                              │   │
│                     │  └──────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
       Dark                    Light Gray + White
```

### Sidebar Collapsed (80px)
```
┌────────────────────────────────────────────────────────────┐
│  │    │              Content Area (expanded)              │
│  │ TF │  ┌────────────────────────────────────────────┐  │
│  │    │  │ ☰   User Info & Avatar ▼                 │  │
│  │    │  └────────────────────────────────────────────┘  │
│  │    │                                                   │
│  │ 📊 │  Main Content (more space)                       │
│  │ 📅 │  ┌────────────────────────────────────────────┐  │
│  │ 📈 │  │                                            │  │
│  │──  │  │  Page renders here (wider)                │  │
│  │ 🏠 │  │                                            │  │
│  │    │  └────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## 📱 Mobile View (< 768px)

### Sidebar Hidden
```
┌─────────────────────────────────┐
│ ☰  User Info & Avatar ▼        │
├─────────────────────────────────┤
│                                 │
│    Content (Full Width)         │
│                                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │  Page renders here        │  │
│  │  (100% width)             │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

### Sidebar Overlay (when opened)
```
┌─────────────────────────────────┐
│┌────────────┐                   │
││TicketFlow  │ [Overlay]         │
││   Admin    │                   │
││            │                   │
││ 📊 Dashboard│                  │
││ 📅 My Events│                  │
││ 📈 Reports  │                  │
││──────────  │                   │
││ 🏠 Home     │                  │
│└────────────┘                   │
│    Dark        Semi-transparent │
│               Background         │
└─────────────────────────────────┘
```

---

## 🎯 Component Hierarchy

```
AdminLayout
    │
    ├─ AdminGuard ──────────── Security Layer
    │   │
    │   ├─ Check isAuthenticated
    │   ├─ Check user.role
    │   │   ├─ Admin (1)     → ✅ Pass
    │   │   ├─ Organizer (2) → ✅ Pass
    │   │   └─ Customer (0)  → ❌ Redirect
    │   │
    │   └─ Render if valid:
    │
    ├─ Ant Design Layout
    │   │
    │   ├─ AdminSidebar ──────── Navigation
    │   │   │
    │   │   ├─ Logo Area
    │   │   ├─ Menu Items
    │   │   │   ├─ Dashboard
    │   │   │   ├─ My Events
    │   │   │   ├─ Reports
    │   │   │   └─ Back to Home
    │   │   │
    │   │   └─ Responsive Logic
    │   │       ├─ Desktop: 250px / 80px
    │   │       └─ Mobile: Overlay
    │   │
    │   ├─ Layout (Main Area)
    │   │   │
    │   │   ├─ AdminHeader ──── Top Bar
    │   │   │   │
    │   │   │   ├─ Left: Toggle Button
    │   │   │   └─ Right: User Dropdown
    │   │   │       ├─ Full Name
    │   │   │       ├─ Role (Vietnamese)
    │   │   │       ├─ Avatar
    │   │   │       └─ Dropdown Menu
    │   │   │           ├─ Profile
    │   │   │           ├─ Settings
    │   │   │           └─ Logout
    │   │   │
    │   │   └─ Content ───────── Main Content
    │   │       │
    │   │       └─ {children} (Page Component)
    │   │
    │   └─ Background: #f5f5f5
    │
    └─ State Management
        ├─ collapsed: boolean
        └─ handleToggle: () => void
```

---

## 🎨 Color Scheme

### Sidebar (Dark Theme)
```
Background:    #001529 (Ant Design dark)
Text:          #ffffff (white)
Active Item:   #1890ff (blue)
Hover:         #111d2c (lighter dark)
Logo BG:       #0050b3 (blue-700)
```

### Header (Light Theme)
```
Background:    #ffffff (white)
Text:          #000000 (black)
Shadow:        rgba(0,0,0,0.08)
Border:        None (clean look)
```

### Content Area
```
Layout BG:     #f5f5f5 (light gray)
Content BG:    #ffffff (white)
Border Radius: 8px
Shadow:        rgba(0,0,0,0.03)
Padding:       24px
```

---

## 📏 Spacing & Dimensions

### Sidebar
```
Width (Expanded):     250px
Width (Collapsed):    80px
Width (Mobile Hidden): 0px
Height:               100vh (full screen)
Position:             Fixed left
```

### Header
```
Height:      64px
Position:    Sticky top
Padding:     0 24px
Z-index:     10
```

### Content
```
Margin:      16px
Padding:     24px
Min-height:  calc(100vh - 64px - 32px)
Border:      None
Shadow:      Subtle (0 1px 2px)
```

### Layout Transitions
```
Sidebar collapse:    0.2s ease
Content margin:      0.2s ease
Mobile overlay:      0.3s ease
```

---

## 🔄 State Flow Diagram

```
User Access Admin Route
        │
        ▼
    AdminGuard
        │
        ├──► Check isAuthenticated
        │       │
        │       ├─ NO → Redirect /login?redirect=/admin/dashboard
        │       │
        │       └─ YES → Continue
        │
        ├──► Check user.role
        │       │
        │       ├─ Customer → Redirect /?error=insufficient_permissions
        │       │
        │       └─ Admin/Organizer → Continue
        │
        ▼
    Render AdminLayout
        │
        ├──► AdminSidebar (collapsed state)
        │       │
        │       ├─ Desktop: User toggle
        │       └─ Mobile: Auto-collapse
        │
        ├──► AdminHeader (user info)
        │       │
        │       ├─ Display name & role
        │       └─ Dropdown actions
        │
        └──► Content Area
                │
                └─ Render {children} (Page)
```

---

## 🖱️ User Interactions

### Sidebar Interactions
```
Action:          Effect:
──────────────────────────────────────────
Click menu item  → Navigate + Highlight
Hover item       → Background lighten
Resize window    → Auto-collapse on mobile
Toggle button    → Collapse/expand sidebar
```

### Header Interactions
```
Action:              Effect:
──────────────────────────────────────────
Click toggle         → Sidebar collapse/expand
Click avatar/name    → Show dropdown menu
Click dropdown item  → Navigate or action
Click logout         → Confirm → Logout
```

---

## 🎭 Animation Timeline

### Page Load (First Visit)
```
0ms:    AdminGuard starts checking
100ms:  Store hydrated from localStorage
150ms:  Security checks complete
200ms:  Layout components render
250ms:  Sidebar slides in
300ms:  Content fades in
400ms:  Active menu item highlights
```

### Sidebar Toggle
```
0ms:    User clicks toggle
50ms:   Sidebar width transition starts
200ms:  Sidebar width transition complete
250ms:  Content margin adjusts
```

### Navigation Click
```
0ms:    User clicks menu item
50ms:   Active state updates
100ms:  Router navigation starts
200ms:  New page component renders
300ms:  Content fade-in complete
```

---

## 📱 Responsive Breakpoints

### Large Desktop (>= 1440px)
```
Sidebar:  250px (default expanded)
Content:  Plenty of space
Layout:   Optimal viewing experience
```

### Desktop (1024px - 1439px)
```
Sidebar:  250px / 80px (user toggle)
Content:  Comfortable reading width
Layout:   Standard admin view
```

### Tablet (768px - 1023px)
```
Sidebar:  250px (auto-collapse on open)
Content:  Full remaining width
Layout:   Slight adjustment
```

### Mobile (< 768px)
```
Sidebar:  Overlay (0px when closed)
Content:  Full viewport width
Layout:   Optimized for touch
```

---

## 🎨 Visual States

### Loading State (AdminGuard checking)
```
┌─────────────────────────────┐
│                             │
│                             │
│         ⏳ (spinner)        │
│                             │
│  Đang kiểm tra quyền...     │
│                             │
└─────────────────────────────┘
```

### Error State (Access Denied)
```
┌─────────────────────────────┐
│         ❌                  │
│  Access Denied              │
│  Redirecting...             │
└─────────────────────────────┘
```

### Active State (Authorized)
```
┌─────────────────────────────┐
│  Full admin layout          │
│  ✅ All components visible  │
│  ✅ Navigation active        │
│  ✅ User info displayed      │
└─────────────────────────────┘
```

---

## 🎯 Focus States

### Menu Item Focus
```
Default:    White text, transparent background
Hover:      White text, lighter dark background
Active:     White text, blue background (#1890ff)
Focus:      Blue outline (keyboard navigation)
```

### Header Elements
```
Toggle:     Transparent → Gray on hover
Avatar:     Border glow on hover
Dropdown:   Shadow appears on open
```

---

## 📐 Z-Index Layers

```
Layer 10:  AdminHeader (sticky)
Layer 5:   Sidebar overlay (mobile)
Layer 1:   Content area
Layer 0:   Background
```

---

## 🎨 Dark Mode (Future Enhancement)

### Current Implementation
```
Sidebar:  Always dark theme
Header:   Always light theme
Content:  Always white/light gray
```

### Future Dark Mode
```
Sidebar:  Darker (#000000)
Header:   Dark (#1f1f1f)
Content:  Dark gray (#2d2d2d)
Text:     Light colors
```

---

**Visual Guide Complete! 🎨**

*Use this reference để hiểu structure & behavior của Admin Layout*  
*Helpful cho designers, developers, và QA testers*
