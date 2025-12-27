# 🧪 AUTH PAGES - TEST SCENARIOS

**Manual Testing Checklist** cho Login và Register Pages

---

## ✅ Pre-Test Setup

### Requirements:
- [ ] Dev server running: `npm run dev`
- [ ] Backend API running at `https://localhost:7207`
- [ ] `.env.local` configured with `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- [ ] Browser console open (F12) để xem logs

---

## 🧪 TEST CASE 1: Register - Happy Path

**Goal**: Đăng ký tài khoản mới thành công

### Steps:

1. **Navigate**:
   ```
   http://localhost:3000/register
   ```

2. **Fill Form**:
   - Email: `newuser@example.com`
   - Full Name: `Nguyen Van A`
   - Phone Number: `0912345678`
   - Date of Birth: `2000-01-01`
   - Password: `Test@12345`
   - Confirm Password: `Test@12345`

3. **Verify Password Strength**:
   - [ ] Progress bar hiển thị
   - [ ] Color: Green (Strong)
   - [ ] Message: "Rất mạnh"
   - [ ] Width: 100%

4. **Submit**:
   - Click "Đăng ký" button

5. **Expected Results**:
   - [ ] Loading spinner appears
   - [ ] Button disabled với opacity-50
   - [ ] Toast notification: "Đăng ký thành công! Vui lòng xác thực email."
   - [ ] Redirect to: `/verify-email?email=newuser@example.com`
   - [ ] Email displayed correctly on verify page

6. **Backend API Call**:
   ```http
   POST https://localhost:7207/api/auth/register
   Content-Type: application/json

   {
     "email": "newuser@example.com",
     "fullName": "Nguyen Van A",
     "phoneNumber": "0912345678",
     "dateOfBirth": "2000-01-01",
     "password": "Test@12345"
   }
   ```

7. **Expected Response**:
   ```json
   Status: 200 OK
   {
     "message": "User registered successfully"
   }
   ```

### ✅ Pass Criteria:
- Form submission không có errors
- API call thành công (200 OK)
- Toast hiển thị đúng message
- Redirect đúng route với query param
- Email hiển thị trên verify page

---

## 🧪 TEST CASE 2: Register - Email Already Exists

**Goal**: Xử lý lỗi khi email đã tồn tại

### Steps:

1. **Navigate**: `http://localhost:3000/register`

2. **Fill Form**:
   - Email: `existing@example.com` (đã có trong database)
   - Full Name: `Test User`
   - Password: `Test@123`
   - Confirm Password: `Test@123`

3. **Submit**: Click "Đăng ký"

4. **Backend Response**:
   ```json
   Status: 400 Bad Request
   {
     "errors": {
       "Email": ["Email already exists"]
     }
   }
   ```

5. **Expected Results**:
   - [ ] Loading state stops
   - [ ] Button re-enabled
   - [ ] Toast error: "Vui lòng kiểm tra lại thông tin đăng ký"
   - [ ] Email field has red border
   - [ ] Error text below email: "Email already exists"
   - [ ] No redirect

### ✅ Pass Criteria:
- Error hiển thị đúng field
- Red border/text styling correct
- Toast notification appears
- Form không reset values

---

## 🧪 TEST CASE 3: Register - Weak Password

**Goal**: Zod validation reject weak password

### Steps:

1. **Navigate**: `http://localhost:3000/register`

2. **Fill Password Field**:
   - Password: `test123` (no uppercase, no special)

3. **Expected Results (Real-time)**:
   - [ ] Password strength bar: RED
   - [ ] Message: "Yếu"
   - [ ] Width: ~25%

4. **Blur Out of Password Field**:
   - [ ] Error appears: "Mật khẩu phải có ít nhất 1 chữ hoa"
   - [ ] Red border on password field

5. **Submit Form**:
   - [ ] Zod validation blocks submission
   - [ ] No API call made
   - [ ] Error messages persist

### Test Variations:

| Password | Expected Error |
|----------|----------------|
| `test123` | "Mật khẩu phải có ít nhất 1 chữ hoa" |
| `Test123` | "Mật khẩu phải có ít nhất 1 ký tự đặc biệt" |
| `Test@12` | "Mật khẩu phải có ít nhất 8 ký tự" |
| `Test` | "Mật khẩu phải có ít nhất 1 số" |

### ✅ Pass Criteria:
- Validation runs before API call
- Error messages accurate
- Password strength indicator correct

---

## 🧪 TEST CASE 4: Register - Confirm Password Mismatch

**Goal**: Zod cross-field validation

### Steps:

1. **Navigate**: `http://localhost:3000/register`

2. **Fill Form**:
   - Password: `Test@123`
   - Confirm Password: `Test@456` (different)

3. **Blur Out of Confirm Password**:
   - [ ] Error appears: "Mật khẩu xác nhận không khớp"
   - [ ] Red border on confirmPassword field

4. **Submit**:
   - [ ] Zod blocks submission
   - [ ] No API call

### ✅ Pass Criteria:
- Cross-field validation works
- Error on correct field (confirmPassword)
- No API call when validation fails

---

## 🧪 TEST CASE 5: Login - Happy Path (Standard)

**Goal**: Login thành công với email/password

### Steps:

1. **Navigate**: `http://localhost:3000/login`

2. **Fill Form**:
   - Email: `user@example.com`
   - Password: `Password@123`
   - Check "Remember me" (optional)

3. **Submit**: Click "Đăng nhập"

4. **Backend API Call**:
   ```http
   POST https://localhost:7207/api/auth/login
   Content-Type: application/json

   {
     "email": "user@example.com",
     "password": "Password@123"
   }
   ```

5. **Expected Response**:
   ```json
   Status: 200 OK
   {
     "accessToken": "eyJhbGciOiJIUzI1NiIs...",
     "refreshToken": "refresh_token_here"
   }
   ```

6. **Expected Results**:
   - [ ] Loading spinner appears
   - [ ] Button disabled
   - [ ] Zustand store updated:
     - [ ] `accessToken` saved
     - [ ] `refreshToken` saved
     - [ ] `user` object populated from JWT decode
     - [ ] `isAuthenticated = true`
   - [ ] SignalR connection established
   - [ ] Console log: "SignalR Connected"
   - [ ] Toast: "Chào mừng trở lại, Nguyen Van A!"
   - [ ] Redirect to: `/`

7. **Verify Store State**:
   ```tsx
   const state = useAuthStore.getState();
   console.log(state.user);
   // {
   //   userId: "user-id-123",
   //   email: "user@example.com",
   //   fullName: "Nguyen Van A",
   //   role: "Customer"
   // }
   ```

### ✅ Pass Criteria:
- API call successful (200 OK)
- Tokens saved to store + localStorage
- JWT decoded correctly
- SignalR connected
- Toast shows user's fullName
- Redirect to home page

---

## 🧪 TEST CASE 6: Login - Invalid Credentials

**Goal**: Xử lý lỗi login sai thông tin

### Steps:

1. **Navigate**: `http://localhost:3000/login`

2. **Fill Form**:
   - Email: `wrong@example.com`
   - Password: `WrongPassword`

3. **Submit**: Click "Đăng nhập"

4. **Backend Response**:
   ```json
   Status: 400 Bad Request
   {
     "message": "Invalid email or password"
   }
   ```

5. **Expected Results**:
   - [ ] Loading stops
   - [ ] Button re-enabled
   - [ ] Toast error: "Email hoặc mật khẩu không chính xác"
   - [ ] Email field has red border
   - [ ] Error text: "Invalid email or password"
   - [ ] No redirect
   - [ ] Store state unchanged (still `isAuthenticated: false`)

### ✅ Pass Criteria:
- Error handling correct
- No tokens saved
- Toast notification appears
- Form values retained

---

## 🧪 TEST CASE 7: Login - Google OAuth

**Goal**: Login với Google account

### Prerequisites:
- [ ] NEXT_PUBLIC_GOOGLE_CLIENT_ID configured
- [ ] Backend `/auth/google-login` endpoint ready
- [ ] Google account có email verified

### Steps:

1. **Navigate**: `http://localhost:3000/login`

2. **Click**: "Đăng nhập với Google" button

3. **OAuth Flow**:
   - [ ] Google OAuth popup opens
   - [ ] User selects Google account
   - [ ] Consent screen (first time only)
   - [ ] Authorize → popup closes

4. **Expected Results**:
   - [ ] Popup closes automatically
   - [ ] Loading state on button
   - [ ] Console log: "Google auth code:", "..."

5. **Backend API Call**:
   ```http
   POST https://localhost:7207/api/auth/google-login
   Content-Type: application/json

   {
     "credential": "google_auth_code_here"
   }
   ```

6. **Backend Response**:
   ```json
   Status: 200 OK
   {
     "accessToken": "eyJhbGciOiJIUzI1NiIs...",
     "refreshToken": "refresh_token_here"
   }
   ```

7. **Expected Results**:
   - [ ] Tokens saved to store
   - [ ] JWT decoded
   - [ ] SignalR connected
   - [ ] Toast: "Chào mừng trở lại, {fullName}!"
   - [ ] Redirect to `/`

### Test Scenarios:

**Scenario A: First-time Google Login**
- Backend creates new user → returns tokens
- Toast: "Chào mừng trở lại!"
- Redirect to `/`

**Scenario B: Existing Google User**
- Backend finds existing user → returns tokens
- Same flow as Scenario A

**Scenario C: User Cancels OAuth**
- Popup closes without authorization
- No API call
- No error message (silent fail)
- Stay on login page

**Scenario D: Backend Error**
- Google auth succeeds but Backend fails
- Toast error: "Đăng nhập Google thất bại"
- No redirect

### ✅ Pass Criteria:
- OAuth popup works correctly
- Backend receives auth code
- Tokens saved and decoded
- Redirect after success
- Error handling for failures

---

## 🧪 TEST CASE 8: Password Visibility Toggle

**Goal**: Show/hide password text

### Steps:

1. **Navigate**: `http://localhost:3000/register` or `/login`

2. **Type Password**: `Test@123`

3. **Verify Default State**:
   - [ ] Input type: `password`
   - [ ] Text hidden: `••••••••`
   - [ ] Icon: Eye (open eye)

4. **Click Eye Icon**:
   - [ ] Input type changes to: `text`
   - [ ] Text visible: `Test@123`
   - [ ] Icon changes to: EyeOff (closed eye)

5. **Click EyeOff Icon**:
   - [ ] Input type changes back to: `password`
   - [ ] Text hidden: `••••••••`
   - [ ] Icon changes back to: Eye

### ✅ Pass Criteria:
- Toggle works on both password and confirmPassword fields
- Icons change correctly
- Input type switches properly

---

## 🧪 TEST CASE 9: Responsive Design

**Goal**: Verify mobile và desktop layouts

### Desktop (>= 1024px):

1. **Navigate**: `http://localhost:3000/login`

2. **Expected Layout**:
   - [ ] Split screen visible
   - [ ] Left side: Image + testimonial + stats
   - [ ] Right side: Form centered
   - [ ] Logo on left side only
   - [ ] Form width: max-width-md

### Tablet (768px - 1023px):

1. **Resize Browser**: Width = 800px

2. **Expected Layout**:
   - [ ] Left side hidden
   - [ ] Mobile logo appears at top
   - [ ] Form takes full width
   - [ ] Footer at bottom

### Mobile (< 768px):

1. **Resize Browser**: Width = 375px (iPhone SE)

2. **Expected Layout**:
   - [ ] Single column
   - [ ] Mobile logo + brand name
   - [ ] Form responsive padding
   - [ ] Buttons full width
   - [ ] Input fields stack vertically
   - [ ] Touch-friendly button size (py-3)

### ✅ Pass Criteria:
- Layout adjusts correctly at breakpoints
- No horizontal scroll on mobile
- Touch targets >= 44px height
- Text readable on all sizes

---

## 🧪 TEST CASE 10: Navigation Links

**Goal**: Verify all navigation works

### Register Page Links:

1. **Navigate**: `http://localhost:3000/register`

2. **Click Links**:
   - [ ] "Đăng nhập ngay" → `/login`
   - [ ] "Điều khoản dịch vụ" → `/terms` (404 expected)
   - [ ] "Chính sách bảo mật" → `/privacy` (404 expected)

### Login Page Links:

1. **Navigate**: `http://localhost:3000/login`

2. **Click Links**:
   - [ ] "Đăng ký ngay" → `/register`
   - [ ] "Quên mật khẩu?" → `/forgot-password` (404 expected)
   - [ ] "Bộ phận hỗ trợ" → `/support` (404 expected)

### Verify Email Page Links:

1. **Navigate**: `http://localhost:3000/verify-email?email=test@example.com`

2. **Click Links**:
   - [ ] "Quay lại trang đăng nhập" → `/login`
   - [ ] "Liên hệ hỗ trợ" → `/support` (404 expected)

### ✅ Pass Criteria:
- All links navigate correctly
- Next.js Link preloading works
- No full page refresh

---

## 🧪 TEST CASE 11: Form Validation (Edge Cases)

### Test: Empty Fields

1. **Navigate**: `http://localhost:3000/register`
2. **Submit**: Click "Đăng ký" without filling anything
3. **Expected**:
   - [ ] Email error: "Email là bắt buộc"
   - [ ] Full Name error: "Họ tên phải có ít nhất 2 ký tự"
   - [ ] Password error: "Mật khẩu phải có ít nhất 8 ký tự"
   - [ ] Confirm Password error: "Vui lòng xác nhận mật khẩu"

### Test: Invalid Email Format

1. **Email**: `notanemail`
2. **Expected**: "Email không hợp lệ"

### Test: Invalid Phone Number

1. **Phone**: `123456` (too short)
2. **Expected**: "Số điện thoại không hợp lệ (VD: 0912345678)"

### Test: Underage (< 13 years old)

1. **Date of Birth**: `2015-01-01` (9 years old)
2. **Expected**: "Bạn phải từ 13 tuổi trở lên"

### Test: Special Characters in Full Name

1. **Full Name**: `John@123` (contains @ and numbers)
2. **Expected**: "Họ tên chỉ được chứa chữ cái và khoảng trắng"

### ✅ Pass Criteria:
- All validation rules enforced
- Error messages clear and helpful
- No API call when validation fails

---

## 🧪 TEST CASE 12: Loading States

### Test: API Request In Progress

1. **Navigate**: `http://localhost:3000/login`

2. **Fill Form**: Valid credentials

3. **Submit**: Click "Đăng nhập"

4. **During API Call**:
   - [ ] Button shows spinner icon
   - [ ] Button text: "Đang xử lý..."
   - [ ] Button disabled (opacity-50, cursor-not-allowed)
   - [ ] All input fields disabled
   - [ ] Cannot submit again (double-click prevention)

5. **After Response**:
   - [ ] Spinner stops
   - [ ] Button re-enabled (if error)
   - [ ] Inputs re-enabled (if error)

### ✅ Pass Criteria:
- UI feedback during loading
- Double-submit prevention works
- Loading state clears on completion

---

## 🧪 TEST CASE 13: Toast Notifications

### Test: Success Toast

1. **Trigger**: Successful registration
2. **Expected**:
   - [ ] Position: top-right
   - [ ] Icon: Green checkmark
   - [ ] Background: Dark (#363636)
   - [ ] Text: White
   - [ ] Duration: 3 seconds
   - [ ] Auto-dismiss

### Test: Error Toast

1. **Trigger**: Login failed
2. **Expected**:
   - [ ] Icon: Red X
   - [ ] Duration: 5 seconds
   - [ ] Can be dismissed manually (click X)

### Test: Multiple Toasts

1. **Trigger**: Multiple errors quickly
2. **Expected**:
   - [ ] Stack vertically
   - [ ] Oldest dismisses first
   - [ ] Max 3 visible at once

### ✅ Pass Criteria:
- Toast appears in correct position
- Auto-dismiss timing correct
- Styling matches design
- Multiple toasts stack properly

---

## 🧪 TEST CASE 14: Accessibility (A11y)

### Keyboard Navigation:

1. **Navigate**: `http://localhost:3000/login`

2. **Tab Through Form**:
   - [ ] Email field focused first
   - [ ] Tab → Password field
   - [ ] Tab → Remember me checkbox
   - [ ] Tab → Submit button
   - [ ] Tab → Links (Register, Forgot password)
   - [ ] Shift+Tab reverses order

3. **Form Submission**:
   - [ ] Enter key submits form when in input field
   - [ ] Space key toggles checkbox

### Screen Reader:

1. **Use NVDA/JAWS**:
   - [ ] Labels read correctly
   - [ ] Error messages announced
   - [ ] Button states announced (loading/disabled)
   - [ ] `aria-invalid` attribute when error
   - [ ] `aria-describedby` links to error ID

### ✅ Pass Criteria:
- All interactive elements keyboard accessible
- Focus visible (ring styles)
- Screen reader announces correctly
- ARIA attributes present

---

## 📊 Test Results Summary

### Template:

```
Test Date: _____________
Tester: _____________
Environment: _____________

Results:
[ ] TC1: Register - Happy Path
[ ] TC2: Register - Email Exists
[ ] TC3: Register - Weak Password
[ ] TC4: Register - Password Mismatch
[ ] TC5: Login - Happy Path
[ ] TC6: Login - Invalid Credentials
[ ] TC7: Login - Google OAuth
[ ] TC8: Password Toggle
[ ] TC9: Responsive Design
[ ] TC10: Navigation Links
[ ] TC11: Form Validation
[ ] TC12: Loading States
[ ] TC13: Toast Notifications
[ ] TC14: Accessibility

Pass Rate: ___/14 (___%)

Issues Found:
1. ___________________________
2. ___________________________
3. ___________________________
```

---

## 🐛 Bug Report Template

```markdown
### Bug Title: [Short description]

**Severity**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. Go to [URL]
2. Do [action]
3. Observe [result]

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happens]

**Screenshots**:
[Attach if applicable]

**Console Errors**:
```
[Paste console logs]
```

**Environment**:
- OS: Windows / macOS / Linux
- Browser: Chrome 120 / Firefox 121 / Safari 17
- Screen: Desktop / Mobile / Tablet

**Additional Context**:
[Any other relevant info]
```

---

## ✅ Testing Checklist Complete

**All 14 test cases completed?**
- If YES: ✅ Auth Pages ready for production!
- If NO: Document issues and create tickets

**Next Steps**:
1. Fix any bugs found
2. Implement OTP verification
3. Add forgot password flow
4. Run automated tests (Playwright/Cypress)

---

*Manual Test Scenarios - Day F2.2*
