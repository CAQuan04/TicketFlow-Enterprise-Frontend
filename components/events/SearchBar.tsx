/**
 * SearchBar Component - Thanh tìm kiếm events với debounce
 * 
 * ============================================
 * CLIENT COMPONENT (use client directive)
 * ============================================
 * 
 * Tại sao là Client Component?
 * - Cần sử dụng React hooks (useState, useEffect)
 * - Cần tương tác với browser (useSearchParams, useRouter)
 * - Cần xử lý user input realtime
 * 
 * ============================================
 * DEBOUNCING STRATEGY
 * ============================================
 * 
 * Vấn đề: User gõ "blackpink" → Gọi API 9 lần (b, bl, bla, ..., blackpink)
 * Giải pháp: Đợi user ngừng gõ 300ms rồi mới gọi API → Chỉ 1 lần!
 * 
 * Thư viện: use-debounce
 * - useDebounce(value, delay): Trả về debounced value
 * - Value chỉ update sau khi user ngừng gõ [delay]ms
 * 
 * ============================================
 * URL STATE MANAGEMENT
 * ============================================
 * 
 * Tại sao lưu search term vào URL?
 * 1. Shareable: User có thể copy link share cho người khác
 * 2. Bookmarkable: User có thể bookmark trang search results
 * 3. Back button: Nhấn back sẽ về search trước đó
 * 4. SEO: Search engines có thể index search results
 * 
 * Implementation:
 * - Read: useSearchParams().get('search')
 * - Write: router.replace(`/events?search=${term}&page=1`)
 * 
 * router.replace vs router.push:
 * - replace: Không thêm vào history (dùng cho mỗi keystroke)
 * - push: Thêm vào history (dùng khi nhấn Enter hoặc Submit)
 * 
 * ============================================
 * PERFORMANCE OPTIMIZATION
 * ============================================
 * 
 * 1. Debounce 300ms: Giảm số lần gọi API
 * 2. Reset page to 1: Khi search mới, luôn về trang 1
 * 3. Preserve other params: Giữ các params khác (venue, date, etc.)
 * 
 * @example
 * <SearchBar placeholder="Tìm kiếm sự kiện..." />
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface SearchBarProps {
  /**
   * Placeholder text cho input
   */
  placeholder?: string;

  /**
   * Debounce delay (ms)
   * Default: 300ms
   */
  debounceDelay?: number;

  /**
   * Size của Input
   * Default: 'large'
   */
  size?: 'large' | 'middle' | 'small';
}

export default function SearchBar({ 
  placeholder = 'Tìm kiếm sự kiện theo tên, địa điểm...', 
  debounceDelay = 300,
  size = 'large' 
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * ============================================
   * STATE MANAGEMENT
   * ============================================
   * 
   * inputValue: Giá trị hiện tại trong input (update mỗi keystroke)
   * debouncedValue: Giá trị sau khi debounce (chỉ update sau 300ms)
   * 
   * Flow:
   * 1. User gõ "b" → inputValue = "b" (instant)
   * 2. User gõ "l" → inputValue = "bl" (instant)
   * 3. ... (user tiếp tục gõ)
   * 4. User ngừng gõ 300ms → debouncedValue = "blackpink"
   * 5. useEffect trigger → Update URL
   */
  
  // Lấy giá trị search hiện tại từ URL (nếu có)
  const initialSearch = searchParams.get('search') || '';
  
  // State cho input value (update mỗi keystroke)
  const [inputValue, setInputValue] = useState(initialSearch);
  
  // Debounced value (chỉ update sau khi user ngừng gõ 300ms)
  const [debouncedValue] = useDebounce(inputValue, debounceDelay);

  /**
   * ============================================
   * SYNC SEARCH PARAMS TO INPUT
   * ============================================
   * 
   * Khi URL search params thay đổi (từ bên ngoài component):
   * - User nhấn Back button
   * - User click vào link với search param
   * → Update input value để match URL
   * 
   * Dependency: searchParams
   * Lý do: searchParams reference thay đổi khi URL update
   */
  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    if (currentSearch !== inputValue) {
      setInputValue(currentSearch);
    }
  }, [searchParams]); // Không thêm inputValue vào dependency để tránh infinite loop

  /**
   * ============================================
   * UPDATE URL WHEN DEBOUNCED VALUE CHANGES
   * ============================================
   * 
   * Khi debouncedValue thay đổi (sau khi user ngừng gõ 300ms):
   * 1. Tạo URLSearchParams mới từ params hiện tại
   * 2. Update 'search' param với giá trị mới
   * 3. Reset 'page' về 1 (quan trọng!)
   * 4. Gọi router.replace để update URL
   * 
   * router.replace vs router.push:
   * - replace: KHÔNG thêm vào browser history
   *   → User nhấn Back sẽ về trang trước khi search
   *   → Tránh tạo 10 entries trong history khi gõ 10 ký tự
   * 
   * - push: Thêm vào browser history
   *   → Dùng khi user nhấn Enter hoặc Submit button
   * 
   * Tại sao reset page về 1?
   * - User đang ở trang 5, search "blackpink"
   * - Kết quả mới có thể chỉ có 2 trang
   * - Nếu không reset, user sẽ thấy "Page 5 not found"
   */
  useEffect(() => {
    // Skip nếu debouncedValue giống với URL hiện tại
    const currentSearch = searchParams.get('search') || '';
    if (debouncedValue === currentSearch) {
      return;
    }

    // Tạo URLSearchParams mới
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedValue) {
      // Có search term → Set param
      params.set('search', debouncedValue);
      params.set('page', '1'); // Reset về trang 1
    } else {
      // Không có search term → Xóa param
      params.delete('search');
      params.set('page', '1');
    }

    // Update URL (không thêm vào history)
    router.replace(`${pathname}?${params.toString()}`);

    // Log để debug
    console.log('🔍 Search updated:', {
      term: debouncedValue,
      url: `${pathname}?${params.toString()}`
    });
  }, [debouncedValue, pathname, router, searchParams]);

  /**
   * ============================================
   * INPUT CHANGE HANDLER
   * ============================================
   * 
   * Xử lý khi user gõ vào input
   * - Update inputValue (instant)
   * - Debounced value sẽ tự động update sau 300ms
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  /**
   * ============================================
   * ENTER KEY HANDLER (OPTIONAL)
   * ============================================
   * 
   * Khi user nhấn Enter:
   * - Force update URL ngay lập tức (không đợi debounce)
   * - Dùng router.push để thêm vào history
   * 
   * Use case: User muốn search ngay, không muốn đợi 300ms
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const params = new URLSearchParams(searchParams.toString());
      
      if (inputValue) {
        params.set('search', inputValue);
        params.set('page', '1');
      } else {
        params.delete('search');
        params.set('page', '1');
      }

      // Dùng push để thêm vào history (khác với auto-update dùng replace)
      router.push(`${pathname}?${params.toString()}`);
      
      console.log('⏎ Enter pressed - Immediate search:', inputValue);
    }
  }, [inputValue, pathname, router, searchParams]);

  /**
   * ============================================
   * CLEAR BUTTON HANDLER
   * ============================================
   * 
   * Khi user nhấn X để clear input:
   * - Clear inputValue
   * - Debounced value sẽ tự động clear sau 300ms
   * - URL sẽ tự động update
   */
  const handleClear = useCallback(() => {
    setInputValue('');
    console.log('🗑️ Search cleared');
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Input
        size={size}
        placeholder={placeholder}
        prefix={<SearchOutlined className="text-gray-400" />}
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        allowClear
        onClear={handleClear}
        className="rounded-lg shadow-sm"
      />
      
      {/* Debug Info (chỉ hiển thị trong development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-gray-500">
          <span className="font-mono">
            Input: "{inputValue}" | Debounced: "{debouncedValue}"
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * ============================================
 * USAGE EXAMPLE
 * ============================================
 * 
 * // Trong page.tsx (Server Component)
 * import SearchBar from '@/components/events/SearchBar';
 * 
 * export default async function EventsPage() {
 *   return (
 *     <div>
 *       <SearchBar />
 *       // ... render events list
 *     </div>
 *   );
 * }
 * 
 * ============================================
 * TESTING CHECKLIST
 * ============================================
 * 
 * 1. Debouncing:
 *    - Gõ "blackpink" nhanh → Chỉ thấy 1 console.log sau 300ms
 *    - Không thấy log cho từng ký tự (b, bl, bla, ...)
 * 
 * 2. URL Update:
 *    - Gõ "concert" → URL thành /events?search=concert&page=1
 *    - Clear search → URL thành /events?page=1
 * 
 * 3. Page Reset:
 *    - Ở trang 3, gõ search mới → URL có page=1
 * 
 * 4. Enter Key:
 *    - Gõ "test", nhấn Enter ngay → URL update instant (không đợi 300ms)
 * 
 * 5. Back Button:
 *    - Search "a" → Search "b" → Nhấn Back → Về search "a"
 * 
 * 6. Clear Button:
 *    - Nhấn X → Input clear → URL remove search param
 */
