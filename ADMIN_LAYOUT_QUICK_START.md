# 🚀 ADMIN LAYOUT - QUICK START GUIDE

## ⚡ Test ngay trong 2 phút!

### 📋 Prerequisites:
- ✅ Dev server đang chạy: `npm run dev`
- ✅ Có tài khoản Admin hoặc Organizer trong database
- ✅ Backend API đang chạy

---

## 🧪 TEST SCENARIOS

### Scenario 1️⃣: Admin Access (Valid)

```bash
# 1. Mở browser: http://localhost:3000/login
# 2. Login với tài khoản Admin
# 3. Navigate to: http://localhost:3000/admin/dashboard
```

**Expected Result:**
```
✅ AdminGuard check passed
✅ Admin Layout rendered
✅ Sidebar shows: Dashboard, My Events, Reports
✅ Header shows: "Nguyễn Văn A (Quản trị viên)"
✅ Content area ready for dashboard page
```

---

### Scenario 2️⃣: Organizer Access (Valid)

```bash
# 1. Login với tài khoản Organizer
# 2. Navigate to: http://localhost:3000/admin/events
```

**Expected Result:**
```
✅ AdminGuard check passed
✅ Access granted (Organizer có quyền)
✅ Sidebar active: "My Events" highlighted
✅ Header shows: "Trần Thị B (Nhà tổ chức)"
```

---

### Scenario 3️⃣: Customer Access (Denied)

```bash
# 1. Login với tài khoản Customer (role = Customer)
# 2. Navigate to: http://localhost:3000/admin/dashboard
```

**Expected Result:**
```
❌ AdminGuard blocks access
🔄 Redirect to: http://localhost:3000/?error=insufficient_permissions
📝 Console: "AdminGuard: Insufficient permissions"
```

---

### Scenario 4️⃣: Not Authenticated (Denied)

```bash
# 1. Logout nếu đang login
# 2. Navigate to: http://localhost:3000/admin/dashboard
```

**Expected Result:**
```
❌ AdminGuard blocks access
🔄 Redirect to: http://localhost:3000/login?redirect=/admin/dashboard
📝 Console: "AdminGuard: User not authenticated"
```

---

## 🎨 TEST RESPONSIVE

### Desktop:
```bash
# 1. Full screen browser
# 2. Click toggle button (☰) in header
```
**Expected:**
- Sidebar: 250px → 80px
- Icons only, no text
- Content margin adjusts smoothly

### Mobile:
```bash
# 1. Resize browser < 768px
# 2. Click toggle button
```
**Expected:**
- Sidebar: Hidden → Overlay appears
- Full width content
- Click outside sidebar → Auto close

---

## 🔍 CHECK CONSOLE LOGS

### Valid Access:
```
🔍 Decoding token: {...}
✅ AdminGuard: Access granted {
  userId: "xxx",
  role: "Admin",
  fullName: "Nguyễn Văn A"
}
```

### Invalid Access:
```
❌ AdminGuard: Insufficient permissions. {
  userRole: "Customer",
  allowedRoles: ["Admin", "Organizer"]
}
```

---

## 🎯 TEST NAVIGATION

### Click each menu item:
```
Dashboard  → /admin/dashboard  ✅
My Events  → /admin/events     ✅
Reports    → /admin/reports    ✅
Home       → /                 ✅
```

**Check:**
- Active item highlighted (blue background)
- URL changed correctly
- Sidebar state persists

---

## 🔐 TEST LOGOUT

```bash
# 1. Click user avatar in header
# 2. Click "Đăng xuất"
# 3. Confirm modal
```

**Expected:**
```
✅ Logout executed
✅ Redirect to /login
✅ Auth store cleared
✅ Try access /admin/dashboard again → Redirect to login
```

---

## 🛠️ TROUBLESHOOTING

### Issue: AdminGuard không redirect

**Check:**
```typescript
// In browser console:
localStorage.getItem('auth-storage')
```

**Fix:**
- Clear localStorage
- Login lại
- Verify token có role claim

---

### Issue: Sidebar không collapse

**Check:**
```typescript
// In AdminSidebar.tsx line 40:
console.log('Collapsed state:', collapsed);
```

**Fix:**
- Verify state management in layout.tsx
- Check CSS transitions
- Test on different browsers

---

### Issue: Active menu không highlight

**Check:**
```typescript
// In browser console:
console.log('Current pathname:', window.location.pathname);
```

**Fix:**
- Verify menu key matches pathname
- Check usePathname() hook
- Compare getSelectedKey() logic

---

## 🎓 ARCHITECTURE NOTES

### Component Tree:
```
AdminLayout
└─ AdminGuard (Security Layer)
   └─ AntD Layout
      ├─ AdminSidebar (Navigation)
      ├─ Layout
      │  ├─ AdminHeader (User Info)
      │  └─ Content
      │     └─ {children} (Page Content)
```

### State Management:
```
AdminLayout:
  - collapsed: boolean (sidebar state)
  - handleToggle: () => void

AdminGuard:
  - isChecking: boolean (hydration wait)
  - useAuthStore: { isAuthenticated, user }

AdminSidebar:
  - isMobile: boolean (responsive)
  - getSelectedKey(): string (active menu)

AdminHeader:
  - getRoleName(): string (display mapping)
```

---

## 📝 QUICK CHECKLIST

Trước khi commit, verify:

- [ ] `npm run build` pass without errors
- [ ] ESLint không có warnings
- [ ] TypeScript compile thành công
- [ ] Test với 3 roles: Admin, Organizer, Customer
- [ ] Test responsive trên mobile
- [ ] Console không có error logs
- [ ] Logout workflow hoạt động
- [ ] Navigation active state đúng

---

## 🚀 READY TO GO!

Nếu tất cả tests pass:

```bash
# Commit changes
git add .
git commit -m "feat(F8.1): Complete Admin Layout with RBAC

- Add AdminGuard security wrapper
- Add AdminSidebar with responsive menu
- Add AdminHeader with user info & logout
- Update Admin Layout with new components
- Implement role-based access control
- Add light gray background for data density

No TODOs - Production ready ✅"
```

---

**Admin Layout F8.1 đã sẵn sàng test! 🎉**

*Mọi thắc mắc, check file ADMIN_LAYOUT_F8.1_COMPLETE.md để biết chi tiết*
