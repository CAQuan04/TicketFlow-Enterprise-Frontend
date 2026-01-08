# F8.1: ADMIN DASHBOARD LAYOUT & RBAC - HOÀN TẤT ✅

## 📋 TỔNG QUAN

Đã xây dựng thành công **Admin Portal Shell** với **Role-Based Access Control (RBAC)** hoàn chỉnh tại `app/(admin)/layout.tsx`.

### 🎯 Mục tiêu đạt được:
- ✅ Security wrapper với AdminGuard
- ✅ Responsive sidebar với auto-collapse
- ✅ Header với user info và logout
- ✅ Layout tối ưu cho Data Density

---

## 🏗️ KIẾN TRÚC COMPONENTS

### 1️⃣ AdminGuard (`components/admin/AdminGuard.tsx`)

**Chức năng:** Bảo vệ toàn bộ Admin Portal bằng RBAC

#### ✨ Features:
- **Authentication Check**: Kiểm tra user đã đăng nhập chưa
- **Authorization Check**: Kiểm tra role có đủ quyền truy cập
- **Smart Redirect**: 
  - Chưa login → `/login?redirect=/admin/dashboard`
  - Không đủ quyền → `/?error=insufficient_permissions`
- **Loading State**: Full-screen spinner khi đang kiểm tra

#### 🔐 Role Mapping:
```typescript
Admin = 1       // Full access
Organizer = 2   // Manage own events
Customer = 0    // No access (bị chặn)
```

#### 💡 Logic Flow:
1. Component mount → Wait 100ms để Zustand hydrate từ localStorage
2. Check `isAuthenticated` từ auth store
3. Check `user.role` có trong danh sách `[Admin, Organizer]`
4. Valid → Render children
5. Invalid → Redirect ngay lập tức

---

### 2️⃣ AdminSidebar (`components/admin/AdminSidebar.tsx`)

**Chức năng:** Navigation menu với collapsed state management

#### ✨ Features:
- **Auto-collapse on Mobile**: Tự động thu gọn khi màn hình < 768px
- **Active State Highlighting**: Tự động highlight menu item dựa vào `pathname`
- **Smooth Transitions**: Animation mượt mà khi collapse/expand
- **Fixed Position**: Sidebar cố định bên trái màn hình

#### 📋 Menu Items:
```
📊 Dashboard      → /admin/dashboard
📅 My Events      → /admin/events
📈 Reports        → /admin/reports
────────────────
🏠 Back to Home   → /
```

#### 🎨 Styling:
- Theme: Dark (tối màu để nổi bật content trắng)
- Width: 250px (expanded), 80px (collapsed), 0px (mobile collapsed)
- Logo Area: "TicketFlow Admin" / "TF"

---

### 3️⃣ AdminHeader (`components/admin/AdminHeader.tsx`)

**Chức năng:** Header bar với toggle và user info

#### ✨ Features:
- **Toggle Button**: Collapse/expand sidebar
- **User Greeting**: Hiển thị Full Name + Role (tiếng Việt)
- **Avatar Dropdown**: Menu với profile, settings, logout
- **Sticky Position**: Luôn hiển thị khi scroll

#### 🎨 Layout:
```
[ ☰ Toggle ]                    [ Nguyễn Văn A (Quản trị viên) 👤 ]
```

#### 📋 Role Display Mapping:
```typescript
Admin      → "Quản trị viên"
Organizer  → "Nhà tổ chức"
Inspector  → "Thanh tra"
Customer   → "Khách hàng"
```

#### 🔽 Dropdown Menu:
- Thông tin cá nhân (UserOutlined)
- Cài đặt (SettingOutlined)
- ────────────
- Đăng xuất (LogoutOutlined, danger)

---

### 4️⃣ Admin Layout (`app/(admin)/layout.tsx`)

**Chức năng:** Layout wrapper lắp ráp tất cả components

#### 🏗️ Structure:
```jsx
<AdminGuard>
  <Layout>
    <AdminSidebar />
    <Layout style={{ marginLeft: collapsed ? 80 : 250 }}>
      <AdminHeader />
      <Content>
        {children}
      </Content>
    </Layout>
  </Layout>
</AdminGuard>
```

#### 🎨 Styling Principles:
- **Background**: `#f5f5f5` (light gray) - Tối ưu Data Density
- **Content**: White background với shadow nhẹ
- **Transitions**: Smooth animation khi sidebar collapse
- **Responsive**: Content margin tự động điều chỉnh

---

## 🚀 SỬ DỤNG

### Protected Routes:
Tất cả routes trong `app/(admin)/*` đều được bảo vệ tự động:

```
/admin/dashboard   ✅ Protected
/admin/events      ✅ Protected
/admin/reports     ✅ Protected
```

### Testing Access Control:

#### ✅ Valid Access (Admin/Organizer):
1. Login với tài khoản Admin hoặc Organizer
2. Navigate to `/admin/dashboard`
3. → Success: Hiển thị Admin Portal

#### ❌ Invalid Access (Customer):
1. Login với tài khoản Customer
2. Navigate to `/admin/dashboard`
3. → Redirect: `/?error=insufficient_permissions`

#### ❌ Not Authenticated:
1. Không login
2. Navigate to `/admin/dashboard`
3. → Redirect: `/login?redirect=/admin/dashboard`

---

## 📱 RESPONSIVE BEHAVIOR

### Desktop (>= 1024px):
- Sidebar: 250px (expanded) / 80px (collapsed)
- Content: Full width với margin tự động
- Toggle: Manual control

### Tablet (768px - 1023px):
- Sidebar: Auto-collapse khi mở
- Content: Full width
- Toggle: Manual control

### Mobile (< 768px):
- Sidebar: Width = 0 (hoàn toàn ẩn)
- Content: Full width (margin = 0)
- Toggle: Hiển thị overlay khi mở

---

## 🎨 DESIGN PHILOSOPHY

### Tại sao cần Layout riêng?

**Admin Portal ≠ Customer Portal**

| Khía cạnh | Admin Portal | Customer Portal |
|-----------|--------------|-----------------|
| Mục đích | Quản lý dữ liệu | Khám phá & mua vé |
| Mật độ info | Cao (tables, charts) | Thấp (cards, images) |
| Background | Light gray | White/gradient |
| Navigation | Sidebar cố định | Top navbar |
| Layout | Dense & efficient | Spacious & beautiful |

### Data Density Optimization:

**Background color `#f5f5f5`** giúp:
- Content trắng nổi bật rõ ràng
- Mắt không bị mỏi khi nhìn tables lâu
- Phân tách rõ các content blocks
- Tăng khả năng focus vào dữ liệu

---

## 🔒 SECURITY NOTES

### AdminGuard - Chốt chặn cuối cùng:

Ngay cả khi ai đó:
- Biết URL `/admin/dashboard`
- Bypass frontend navigation
- Login bằng tài khoản Customer

→ **Vẫn bị chặn ngay lập tức** bởi AdminGuard

### Defense Layers:
1. **Frontend Guard**: AdminGuard component
2. **Backend Authorization**: JWT role claims
3. **API Middleware**: .NET Authorization attributes

---

## 📝 NEXT STEPS (Future Enhancements)

### Đã hoàn thành:
- [x] AdminGuard với RBAC
- [x] AdminSidebar với menu navigation
- [x] AdminHeader với user info
- [x] Admin Layout assembly
- [x] Responsive design
- [x] Active state management

### Có thể mở rộng:
- [ ] Breadcrumb navigation
- [ ] Quick actions panel
- [ ] Notification center
- [ ] Theme switcher (light/dark)
- [ ] Multi-language support
- [ ] Keyboard shortcuts

---

## 🧪 TESTING CHECKLIST

### ✅ Security Tests:
- [x] Login as Admin → Access granted
- [x] Login as Organizer → Access granted
- [x] Login as Customer → Redirect to home
- [x] Not logged in → Redirect to login

### ✅ UI Tests:
- [x] Sidebar collapse/expand works
- [x] Active menu item highlights correctly
- [x] User dropdown shows correct info
- [x] Logout button works
- [x] Responsive breakpoints work

### ✅ Navigation Tests:
- [x] All menu items navigate correctly
- [x] "Back to Home" returns to `/`
- [x] Pathname changes update active state

---

## 🎓 GÓC NHÌN ARCHITECT

### Separation of Concerns:

```
app/
├── (root)/          → Customer-facing pages
│   └── layout.tsx   → Spacious, beautiful layout
│
├── (admin)/         → Admin portal
│   └── layout.tsx   → Dense, efficient layout
│
└── (auth)/          → Authentication pages
    └── layout.tsx   → Minimal layout
```

**Lợi ích:**
- Mỗi route group có layout phù hợp với mục đích
- Không conflict CSS/components giữa các nhóm
- Dễ maintain và scale
- Clear mental model cho developers

### RBAC Architecture:

```
AdminGuard
    ↓
Check isAuthenticated
    ↓
Check user.role ∈ [Admin, Organizer]
    ↓
Valid → Render AdminLayout
    ↓
AdminLayout wraps all admin pages
    ↓
Each page inherits protection automatically
```

**Security Note:**
Frontend guard chỉ là UI layer. Backend API vẫn phải validate JWT và role claims trong mỗi request để đảm bảo security tuyệt đối.

---

## 📞 SUPPORT

Nếu gặp vấn đề:
1. Check browser console cho error logs
2. Verify auth store có user data đúng
3. Confirm role mapping khớp với backend
4. Test với các role khác nhau

**Admin Layout F8.1 đã hoàn tất! 🎉**

---

*Generated: Day F8.1 - Admin Dashboard Layout & RBAC*  
*Status: COMPLETE ✅*  
*No TODOs - Production Ready 🚀*
