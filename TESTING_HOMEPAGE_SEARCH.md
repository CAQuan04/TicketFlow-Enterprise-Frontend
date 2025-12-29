# 🧪 HƯỚNG DẪN TEST - DAY F3.3: HOMEPAGE, SEARCH & SERVER COMPONENTS

## 📋 TỔNG QUAN

Đã implement:
1. ✅ SearchBar component với debounce (300ms)
2. ✅ Homepage Server Component với parallel fetching
3. ✅ Loading UI với skeleton
4. ✅ Next.js 15 compatibility (await searchParams)

---

## 🎯 TEST CASE 1: SEARCH BAR DEBOUNCING

### Mục đích
Kiểm tra debounce hoạt động đúng, không gọi API mỗi keystroke.

### Các bước test

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Mở browser:**
   - Truy cập `http://localhost:3000`
   - Mở Console (F12)

3. **Test debounce:**
   - Gõ nhanh "blackpink" vào search bar
   - ✅ **Expected:** Chỉ thấy 1 console.log sau 300ms
   - ❌ **Fail:** Thấy nhiều log (b, bl, bla, ...)

4. **Verify URL:**
   - Sau 300ms, URL thành: `/?search=blackpink&page=1`
   - ✅ **Expected:** URL update tự động
   - ❌ **Fail:** URL không đổi

5. **Test clear:**
   - Nhấn nút X (clear button)
   - ✅ **Expected:** URL về `/` hoặc `/?page=1`
   - ❌ **Fail:** URL vẫn có search param

---

## 🎯 TEST CASE 2: ENTER KEY INSTANT SEARCH

### Mục đích
Khi user nhấn Enter, search ngay không đợi debounce.

### Các bước test

1. **Gõ "concert" (chậm, không nhấn Enter):**
   - Đợi 300ms → URL update
   - Console log: "🔍 Search updated: concert"

2. **Gõ "festival", nhấn Enter NGAY:**
   - URL update INSTANT (không đợi 300ms)
   - Console log: "⏎ Enter pressed - Immediate search: festival"
   - ✅ **Expected:** Search ngay lập tức
   - ❌ **Fail:** Vẫn phải đợi 300ms

---

## 🎯 TEST CASE 3: PAGE RESET KHI SEARCH

### Mục đích
Khi search mới, page phải reset về 1.

### Các bước test

1. **Tạo nhiều sự kiện để có pagination** (hoặc test với mock data)

2. **Đi đến trang 3:**
   - URL: `/?page=3`

3. **Gõ search "blackpink":**
   - Đợi 300ms
   - ✅ **Expected:** URL thành `/?search=blackpink&page=1`
   - ❌ **Fail:** URL vẫn là `/?search=blackpink&page=3`

4. **Clear search:**
   - Nhấn X button
   - ✅ **Expected:** URL về `/?page=1`
   - ❌ **Fail:** URL về `/?page=3`

---

## 🎯 TEST CASE 4: BACK BUTTON BEHAVIOR

### Mục đích
Browser back button phải hoạt động đúng.

### Các bước test

1. **Start tại homepage:** `/`

2. **Search "a":**
   - URL: `/?search=a&page=1`

3. **Search "ab":**
   - URL: `/?search=ab&page=1`

4. **Search "abc":**
   - URL: `/?search=abc&page=1`

5. **Nhấn Back button 1 lần:**
   - ✅ **Expected:** URL về `/?search=ab&page=1`
   - ❌ **Fail:** URL về `/` hoặc không đổi

6. **Lý do pass:**
   - Debounce dùng `router.replace` (không thêm vào history)
   - Chỉ search cuối cùng được add vào history
   - Back button không nhảy qua từng keystroke

---

## 🎯 TEST CASE 5: SERVER COMPONENT DATA FETCHING

### Mục đích
Homepage fetch data trên server, SEO-friendly.

### Các bước test

1. **View Page Source:**
   - Right-click → "View Page Source"
   - Tìm event name trong HTML
   - ✅ **Expected:** Thấy event data trong HTML
   - ❌ **Fail:** Chỉ thấy `<div id="__next"></div>` trống

2. **Check Network tab:**
   - Mở DevTools → Network
   - Refresh trang
   - ✅ **Expected:** KHÔNG thấy fetch request từ browser
   - ❌ **Fail:** Thấy request `/api/events` từ browser

3. **Lý do:**
   - Server Component fetch data trên server
   - HTML đã có data khi gửi về browser
   - Client không cần fetch lại

---

## 🎯 TEST CASE 6: PARALLEL FETCHING PERFORMANCE

### Mục đích
Kiểm tra parallel fetching nhanh hơn sequential.

### Các bước test

1. **Check console logs:**
   ```
   🏠 Homepage Params: { searchTerm: undefined, pageIndex: 1 }
   ✅ Homepage Data: { featured: 3, search: 12, page: 1, total: 100 }
   ```

2. **Verify timing:**
   - Mở Network tab → Check waterfall
   - 2 requests (featured + search) chạy **đồng thời**
   - ✅ **Expected:** 2 requests overlap (parallel)
   - ❌ **Fail:** Request 2 bắt đầu sau request 1 (sequential)

3. **Measure time:**
   - Nếu mỗi request 500ms:
   - Sequential: 1000ms
   - Parallel: 500ms (nhanh gấp đôi!)

---

## 🎯 TEST CASE 7: LOADING SKELETON

### Mục đích
Loading skeleton hiển thị khi data đang fetch.

### Các bước test

**Option 1: Add delay (Recommended for testing)**

1. Thêm delay vào `page.tsx`:
   ```ts
   // Thêm ngay sau await searchParams
   await new Promise(r => setTimeout(r, 3000)); // 3 second delay
   ```

2. Refresh trang:
   - ✅ **Expected:** Thấy skeleton 3 giây, sau đó thấy data
   - ❌ **Fail:** Màn hình trắng 3 giây

**Option 2: Network throttling**

1. Chrome DevTools → Network → Slow 3G

2. Refresh trang:
   - ✅ **Expected:** Thấy skeleton khi loading
   - ❌ **Fail:** Màn hình trắng

3. Kiểm tra layout shift:
   - Skeleton → Real content không bị "nhảy"
   - ✅ **Expected:** Smooth transition
   - ❌ **Fail:** Content nhảy, thay đổi vị trí

---

## 🎯 TEST CASE 8: SEARCH RESULTS DISPLAY

### Mục đích
Search results hiển thị đúng với query.

### Các bước test

1. **Search với keyword có kết quả:**
   - Gõ "blackpink"
   - ✅ **Expected:** 
     - Hiện "Tìm thấy X sự kiện cho 'blackpink'"
     - Grid có events matching keyword
   - ❌ **Fail:** Empty state hoặc không filter

2. **Search với keyword không có kết quả:**
   - Gõ "xyz123abc"
   - ✅ **Expected:**
     - Hiện "Không tìm thấy sự kiện nào cho 'xyz123abc'"
     - Empty state với button "Xem tất cả sự kiện"
   - ❌ **Fail:** Vẫn hiện events

3. **Clear search:**
   - Nhấn button "Xem tất cả sự kiện"
   - ✅ **Expected:** Về homepage `/` với all events
   - ❌ **Fail:** URL không đổi

---

## 🎯 TEST CASE 9: PAGINATION

### Mục đích
Pagination hoạt động đúng với search.

### Các bước test

1. **No search, page 2:**
   - URL: `/?page=2`
   - ✅ **Expected:** Hiển thị events trang 2
   - ❌ **Fail:** Vẫn hiện trang 1

2. **Search + pagination:**
   - URL: `/?search=concert&page=2`
   - ✅ **Expected:** Events matching "concert", trang 2
   - ❌ **Fail:** Tất cả events trang 2 (không filter)

3. **Pagination buttons:**
   - Trang 1: Không có "Trang trước"
   - Trang cuối: Không có "Trang sau"
   - ✅ **Expected:** Buttons ẩn đúng logic
   - ❌ **Fail:** Buttons vẫn hiện hoặc link sai

---

## 🎯 TEST CASE 10: NEXT.JS 15 COMPATIBILITY

### Mục đích
Verify await searchParams hoạt động (Next.js 15).

### Các bước test

1. **Check TypeScript errors:**
   ```bash
   npm run build
   ```
   - ✅ **Expected:** No TypeScript errors
   - ❌ **Fail:** Error về searchParams type

2. **Runtime check:**
   - Console không có warnings về searchParams
   - ✅ **Expected:** No warnings
   - ❌ **Fail:** Warning: "searchParams should be awaited"

---

## 🎯 TEST CASE 11: RESPONSIVE DESIGN

### Mục đích
Layout responsive trên các màn hình.

### Các bước test

1. **Mobile (375px):**
   - Events grid: 1 column
   - Search bar: Full width
   - ✅ **Expected:** Layout đẹp, không bị vỡ

2. **Tablet (768px):**
   - Events grid: 2 columns
   - Featured events: 3 columns

3. **Desktop (1280px):**
   - Events grid: 4 columns
   - Featured events: 5 columns

4. **Large (1920px):**
   - Layout không quá rộng (max-width container)

---

## 🎯 TEST CASE 12: SEO VERIFICATION

### Mục đích
Verify HTML có data cho SEO.

### Các bước test

1. **View Page Source:**
   ```html
   <!-- Phải thấy: -->
   <h1>BLACKPINK World Tour Hanoi</h1>
   <p>2025-12-20T19:00:00</p>
   <span>2000000</span>
   ```

2. **Meta tags:**
   - Kiểm tra có title, description
   - ✅ **Expected:** Meta tags đầy đủ
   - ❌ **Fail:** Meta tags trống hoặc default

3. **Social sharing:**
   - Share link trên Facebook/Discord
   - ✅ **Expected:** Preview card hiện đúng
   - ❌ **Fail:** No preview hoặc preview lỗi

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] SearchBar debounce 300ms
- [ ] Enter key instant search
- [ ] Page reset về 1 khi search
- [ ] Back button hoạt động đúng
- [ ] Server Component fetch data (không client-side fetch)
- [ ] Parallel fetching (2 requests đồng thời)
- [ ] Loading skeleton hiển thị smooth
- [ ] Search results filter đúng
- [ ] Pagination với search param
- [ ] Next.js 15 await searchParams
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] SEO: HTML có data, meta tags đầy đủ

---

## 🐛 COMMON ISSUES & FIXES

### Issue 1: Debounce không hoạt động
**Symptoms:** Mỗi keystroke gọi API

**Fix:** 
- Check `useDebounce` import
- Verify delay 300ms
- Console.log debouncedValue

### Issue 2: URL không update
**Symptoms:** Search không thay đổi URL

**Fix:**
- Check `useRouter` from `next/navigation` (NOT `next/router`)
- Verify `router.replace` được gọi
- Check URLSearchParams syntax

### Issue 3: Page không reset về 1
**Symptoms:** Search mới vẫn ở trang cũ

**Fix:**
- Check logic set `page=1` trong URLSearchParams
- Verify order: set search → set page

### Issue 4: Loading không hiện
**Symptoms:** Màn hình trắng khi fetch data

**Fix:**
- Check `loading.tsx` nằm đúng folder `app/(root)/`
- Verify page.tsx là async function
- Check có await data fetching

### Issue 5: Server Component lỗi
**Symptoms:** Error "useState cannot be used in Server Component"

**Fix:**
- Remove `'use client'` directive
- Remove useState, useEffect
- Check không import client components trực tiếp

---

## 📊 EXPECTED RESULTS

**Performance:**
- FCP < 1s
- LCP < 2.5s
- CLS < 0.1

**Functionality:**
- Search responsive < 300ms (perceived)
- Parallel fetch nhanh gấp đôi sequential
- Zero client-side data fetching

**SEO:**
- HTML source có full event data
- Meta tags complete
- Social sharing preview works

---

## 🎓 KEY LEARNINGS

1. **Server Components:**
   - Tốt cho SEO, performance
   - Fetch data trên server
   - HTML có data ngay từ đầu

2. **Debouncing:**
   - Giảm API calls
   - Better UX (không lag)
   - Save bandwidth

3. **Parallel Fetching:**
   - `Promise.all` nhanh hơn await sequential
   - Independent requests chạy đồng thời
   - Reduce total wait time

4. **Loading UI:**
   - Skeleton tốt hơn spinner
   - Match layout thật
   - Smooth transition

5. **Next.js 15:**
   - Must await searchParams
   - Better streaming support
   - Improved type safety

---

Chúc bạn test thành công! 🚀
