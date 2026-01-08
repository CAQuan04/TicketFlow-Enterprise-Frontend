# 🧪 TEST GUIDE - F8.1 & F8.2 ADMIN PORTAL

## 🎯 TỔNG KẾT NHỮNG GÌ ĐÃ CÓ

### ✅ F8.1: Admin Layout & RBAC (HOÀN TẤT)
**Components:**
- `AdminGuard` - Security wrapper với role checking
- `AdminSidebar` - Navigation menu responsive
- `AdminHeader` - User info & logout
- `Admin Layout` - Layout assembly hoàn chỉnh

**Features:**
- ✅ Role-Based Access Control (Admin + Organizer)
- ✅ Responsive sidebar (auto-collapse mobile)
- ✅ Active navigation highlighting
- ✅ User dropdown menu
- ✅ Smooth animations

---

### ✅ F8.2: Dashboard & Analytics (HOÀN TẤT)
**Services:**
- `stats.service.ts` - API call + mock chart data
- `stats.types.ts` - TypeScript definitions

**Features:**
- ✅ 4 Statistic Cards (Revenue, Tickets, Events, Users)
- ✅ Revenue Chart (7 ngày với Recharts)
- ✅ Quick Insights (3 tính toán thực tế)
- ✅ Loading states
- ✅ Error handling với fallback

---

## 🚀 CÁCH TEST

### ⚡ Quick Test (5 phút)

#### **Bước 1: Start Dev Server**
```bash
npm run dev
```

#### **Bước 2: Login với Admin/Organizer**
```bash
# Browser: http://localhost:3000/login
# Nhập credentials của tài khoản Admin hoặc Organizer
```

#### **Bước 3: Navigate to Dashboard**
```bash
# Sau khi login thành công
# URL: http://localhost:3000/admin/dashboard
```

#### **Bước 4: Kiểm tra Dashboard**
```
✅ Hiển thị 4 cards với số liệu
✅ Chart 7 ngày hiển thị
✅ Quick Insights section hiển thị
✅ Không có lỗi trong console
```

---

## 🧪 TEST SCENARIOS CHI TIẾT

### 📋 Test F8.1: Admin Layout & Security

#### ✅ Test 1: Admin Access (Should Pass)
```bash
1. Login với tài khoản role = Admin
2. Navigate: http://localhost:3000/admin/dashboard
3. Expected: ✅ Vào được admin portal
4. Check:
   - Sidebar hiển thị đầy đủ menu
   - Header hiển thị tên user + "Quản trị viên"
   - Content area render dashboard
```

#### ✅ Test 2: Organizer Access (Should Pass)
```bash
1. Login với tài khoản role = Organizer
2. Navigate: http://localhost:3000/admin/dashboard
3. Expected: ✅ Vào được admin portal
4. Check:
   - Header hiển thị tên user + "Nhà tổ chức"
   - Có đầy đủ quyền truy cập
```

#### ❌ Test 3: Customer Access (Should Deny)
```bash
1. Login với tài khoản role = Customer
2. Navigate: http://localhost:3000/admin/dashboard
3. Expected: ❌ Bị chặn và redirect
4. Check:
   - Redirect về: http://localhost:3000/?error=insufficient_permissions
   - Console log: "AdminGuard: Insufficient permissions"
```

#### ❌ Test 4: Not Authenticated (Should Deny)
```bash
1. Logout hoặc không login
2. Navigate: http://localhost:3000/admin/dashboard
3. Expected: ❌ Bị chặn và redirect
4. Check:
   - Redirect về: http://localhost:3000/login?redirect=/admin/dashboard
   - Console log: "AdminGuard: User not authenticated"
```

#### ✅ Test 5: Sidebar Navigation
```bash
Click từng menu item:
- Dashboard → /admin/dashboard ✅
- My Events → /admin/events ✅
- Reports → /admin/reports ✅
- Back to Home → / ✅

Check: Active item có background xanh
```

#### ✅ Test 6: Sidebar Collapse
```bash
Desktop:
1. Click toggle button (☰) ở header
2. Expected: Sidebar 250px → 80px
3. Check: Chỉ hiển thị icons, content margin tự động

Mobile (< 768px):
1. Resize browser < 768px
2. Expected: Sidebar tự động ẩn (width = 0)
3. Click toggle → Overlay sidebar xuất hiện
4. Click bên ngoài → Auto close
```

#### ✅ Test 7: User Dropdown
```bash
1. Click vào avatar/tên user ở header
2. Expected: Dropdown menu hiển thị
3. Menu items:
   - Thông tin cá nhân
   - Cài đặt
   - Đăng xuất
4. Click "Đăng xuất"
5. Confirm → Redirect về /login
```

---

### 📊 Test F8.2: Dashboard Analytics

#### ✅ Test 8: Dashboard Loading
```bash
1. Navigate to /admin/dashboard
2. Expected: Loading spinner hiển thị
3. Check console:
   - "📊 Admin Stats fetched: {...}"
   - "📈 Chart data generated: [...]"
4. Dashboard render sau 1-2 giây
```

#### ✅ Test 9: Statistic Cards
```bash
Kiểm tra 4 cards:

Card 1 - Total Revenue:
- ✅ Border xanh lá 2px (nổi bật)
- ✅ Icon: DollarOutlined (green)
- ✅ Font lớn hơn các card khác
- ✅ Format: "125,000,000 VNĐ"

Card 2 - Tickets Sold:
- ✅ Icon: TagsOutlined (blue)
- ✅ Number: Từ API

Card 3 - Active Events:
- ✅ Icon: CalendarOutlined (purple)
- ✅ Number: Từ API

Card 4 - Total Users:
- ✅ Icon: UserOutlined (orange)
- ✅ Number: Từ API
```

#### ✅ Test 10: Revenue Chart
```bash
Kiểm tra chart:
- ✅ Title: "Xu Hướng Doanh Thu (7 Ngày Gần Nhất)"
- ✅ Height: 400px
- ✅ X-axis: 7 ngày (31/12, 01/01, ..., 06/01)
- ✅ Y-axis: Format "4.5M", "125K"
- ✅ Area: Gradient fill (blue)
- ✅ Curve: Smooth (monotone)

Hover test:
1. Hover vào các điểm trên chart
2. Expected: Tooltip hiển thị
3. Content:
   - "Hôm nay (06/01)" hoặc "Hôm qua (05/01)"
   - "Doanh thu: 4,500,000 VNĐ"
```

#### ✅ Test 11: Quick Insights
```bash
Kiểm tra 3 boxes:

Box 1 - Doanh thu TB/ngày:
- ✅ Background: Blue-50
- ✅ Tính toán: totalRevenue / 30
- ✅ Format: "4,166,667 VNĐ"

Box 2 - TB vé/sự kiện:
- ✅ Background: Green-50
- ✅ Tính toán: totalTickets / totalEvents
- ✅ Format: "22" (number)

Box 3 - Giá vé TB:
- ✅ Background: Purple-50
- ✅ Tính toán: totalRevenue / totalTickets
- ✅ Format: "101,296 VNĐ"
```

#### ✅ Test 12: Error Handling
```bash
Simulate API error:
1. Stop backend server
2. Reload dashboard
3. Expected:
   - ✅ Warning alert hiển thị
   - ✅ Fallback data vẫn render
   - ✅ Không crash, vẫn usable
   - ✅ Console: "❌ Error fetching admin stats"
```

#### ✅ Test 13: Responsive Dashboard
```bash
Desktop (>= 1024px):
- 4 cards in 1 row
- Chart full width

Tablet (768-1023px):
- 2 cards per row
- Chart full width

Mobile (< 768px):
- 1 card per column
- Chart responsive width
- Scroll horizontal nếu cần
```

---

## 🎨 VISUAL CHECKS

### Colors (Kiểm tra bằng mắt)
```
Revenue Card: Green border (#52c41a) ✅
Revenue Icon: Dark green (#3f8600) ✅
Tickets Icon: Blue (#1890ff) ✅
Events Icon: Purple (#722ed1) ✅
Users Icon: Orange (#fa8c16) ✅
Chart Area: Blue gradient ✅
Background: Light gray (#f5f5f5) ✅
Content: White (#ffffff) ✅
```

### Typography
```
Page Title: 2xl, bold ✅
Revenue Card Value: 28px, bold ✅
Other Card Values: 24px, normal ✅
Card Titles: 14px, gray ✅
Chart Labels: 12px ✅
```

---

## 🐛 TROUBLESHOOTING

### Issue 1: "Access Denied" khi vào admin
**Nguyên nhân:** User role không đúng hoặc chưa login

**Fix:**
```bash
1. Check console logs
2. Xem localStorage: auth-storage
3. Verify user.role = "Admin" hoặc "Organizer"
4. Nếu role = "Customer" → Login lại với account khác
```

### Issue 2: Dashboard trống hoặc loading mãi
**Nguyên nhân:** Backend API không response

**Fix:**
```bash
1. Check backend đang chạy: http://localhost:5000
2. Xem Network tab: API call /admin/stats/overview
3. Nếu 401 → Token expired, login lại
4. Nếu 404 → Backend chưa implement endpoint
5. Nếu 500 → Backend error, check logs

Fallback: Dashboard vẫn hiển thị mock data
```

### Issue 3: Chart không hiển thị
**Nguyên nhân:** Recharts chưa install hoặc import error

**Fix:**
```bash
1. Check: npm list recharts
2. Nếu không có: npm install recharts
3. Restart dev server: npm run dev
4. Clear browser cache
```

### Issue 4: Sidebar không collapse
**Nguyên nhân:** State management issue

**Fix:**
```bash
1. Check console errors
2. Verify collapsed state trong AdminLayout
3. Test toggle button có trigger handleToggle
4. Clear browser cache và reload
```

---

## 📝 CHECKLIST HOÀN CHỈNH

### F8.1 Checklist:
- [ ] Admin login → Access granted
- [ ] Organizer login → Access granted
- [ ] Customer login → Access denied
- [ ] No login → Redirect to login
- [ ] Sidebar menu navigation works
- [ ] Sidebar collapse/expand works
- [ ] Active menu highlights correctly
- [ ] User dropdown displays info
- [ ] Logout workflow completes
- [ ] Responsive on mobile (< 768px)

### F8.2 Checklist:
- [ ] Dashboard loads without errors
- [ ] 4 statistic cards display data
- [ ] Revenue card has green border (nổi bật)
- [ ] Chart displays 7 days data
- [ ] Chart tooltip works on hover
- [ ] Quick insights calculate correctly
- [ ] Error handling shows fallback
- [ ] Loading spinner shows briefly
- [ ] Currency format correct (VNĐ)
- [ ] Responsive on mobile

---

## 🎓 WHAT YOU HAVE NOW

### 🏗️ Infrastructure
```
✅ Admin Portal Shell (F8.1)
   - Security layer (AdminGuard)
   - Navigation system (Sidebar)
   - User management (Header)
   - Responsive layout

✅ Analytics Dashboard (F8.2)
   - Stats API integration
   - Chart visualization
   - Business metrics
   - Professional UI
```

### 📦 Components (Reusable)
```
Admin Components:
├─ AdminGuard.tsx (95 lines)
├─ AdminSidebar.tsx (120 lines)
├─ AdminHeader.tsx (115 lines)
└─ index.ts (exports)

Dashboard:
└─ page.tsx (290 lines)
```

### 🔧 Services & Types
```
Services:
└─ stats.service.ts (150 lines)
   - getAdminStats()
   - formatCurrency()
   - formatCompactNumber()

Types:
└─ stats.types.ts (40 lines)
   - AdminStatsResponse
   - DashboardData
   - ChartDataPoint
```

### 🎨 UI Library Stack
```
✅ Ant Design - Layout, Cards, Statistics
✅ Recharts - Area charts với gradient
✅ Tailwind CSS - Utility classes
✅ TypeScript - Type safety
```

---

## 🚀 READY FOR NEXT STEPS

Với F8.1 + F8.2, anh giờ có:

### ✅ Foundation Layer
- Admin portal structure
- Security & RBAC
- Navigation system
- Analytics dashboard

### 🎯 Next Features (F8.3+)
- Event Management (Create/Edit/Delete)
- Order Management (View/Process)
- User Management (CRUD)
- Reports & Export
- Real-time notifications

### 📊 API Endpoints Needed
```
Current:
✅ GET /admin/stats/overview (F8.2)

Future:
⏳ GET /admin/events (F8.3)
⏳ POST /admin/events (F8.3)
⏳ GET /admin/orders (F8.4)
⏳ GET /admin/users (F8.5)
```

---

## 💡 TIPS

### Best Practices
```
✅ Always test với 3 roles: Admin, Organizer, Customer
✅ Check console logs cho security events
✅ Test responsive trên mobile
✅ Verify error handling (stop backend)
✅ Clear localStorage nếu có issues
```

### Debug Commands
```bash
# Check auth store
localStorage.getItem('auth-storage')

# Check current user
console.log(useAuthStore.getState().user)

# Check route pathname
console.log(window.location.pathname)

# Check recharts version
npm list recharts
```

---

## 🎉 SUCCESS METRICS

Nếu tất cả tests pass:
- ✅ F8.1: Admin Layout working perfectly
- ✅ F8.2: Dashboard showing data
- ✅ No console errors
- ✅ Responsive on all screen sizes
- ✅ Security working (RBAC)

**CONGRATULATIONS! Admin Portal Foundation Complete! 🎊**

---

**Questions? Check console logs cho detailed debugging info!**
