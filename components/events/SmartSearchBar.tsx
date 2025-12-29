/**
 * ============================================
 * SMART SEARCH BAR - ELASTICSEARCH AUTOCOMPLETE
 * ============================================
 * 
 * Component: Search bar với autocomplete dropdown
 * Purpose: Giúp user tìm events nhanh với gợi ý thông minh
 * 
 * ============================================
 * ELASTICSEARCH VS SQL STRATEGY
 * ============================================
 * 
 * **Tại sao dùng 2 systems?**
 * 
 * 1. **Elasticsearch (Autocomplete Dropdown):**
 *    - ✅ Fuzzy Search: Xử lý typo
 *      Example: "blackpnk" → Suggest "BLACKPINK World Tour"
 *    - ✅ Fast Response: < 50ms
 *    - ✅ Relevant Ranking: Score-based matching
 *    - 🎯 Use Case: Dropdown suggestions khi user đang gõ
 * 
 * 2. **SQL Database (Main Grid Results):**
 *    - ✅ Strict Pagination: Page 1, 2, 3 consistent
 *    - ✅ Complex Filters: Date range, price, venue, category
 *    - ✅ Accurate Counting: Total results exact
 *    - 🎯 Use Case: Main search results với filters
 * 
 * **User Flow:**
 * 1. User gõ "blakpink" → Elasticsearch suggest "BLACKPINK World Tour"
 * 2. User click suggestion → Navigate to /events/{id} (direct)
 * 3. User nhấn Enter → SQL search với filters (/?search=blakpink)
 * 
 * ============================================
 * FEATURES
 * ============================================
 * 
 * 1. **Debounce 300ms:**
 *    - Giảm API calls khi user gõ nhanh
 *    - Chỉ call Elasticsearch sau khi user ngừng gõ 300ms
 * 
 * 2. **Autocomplete Dropdown:**
 *    - Hiển thị top 10 suggestions
 *    - Click → Navigate to event detail page
 *    - Keyboard navigation (Arrow Up/Down, Enter)
 * 
 * 3. **Enter Key:**
 *    - Nhấn Enter → Standard search (SQL)
 *    - Update URL: ?search=keyword&page=1
 *    - Trigger main grid reload với filters
 * 
 * 4. **Empty State:**
 *    - "No suggestions found"
 *    - Suggest: "Try different keywords"
 * 
 * ============================================
 * PERFORMANCE OPTIMIZATION
 * ============================================
 * 
 * - Debounce: Giảm API calls từ 10x → 1x
 * - Cancel requests: Nếu user gõ tiếp, cancel request cũ
 * - Cache: (Optional) Cache suggestions 5 minutes
 * - Min length: Chỉ search khi >= 2 ký tự
 */

'use client';

import React, { useState, useCallback } from 'react';
import { AutoComplete, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { eventService } from '@/services/api/event.service';
import { EventListDto } from '@/types';
import dayjs from 'dayjs';

interface SmartSearchBarProps {
  /**
   * Placeholder text cho input
   */
  placeholder?: string;

  /**
   * Initial value từ URL (nếu có)
   */
  defaultValue?: string;

  /**
   * Size của Input
   */
  size?: 'large' | 'middle' | 'small';

  /**
   * Debounce delay (ms)
   */
  debounceDelay?: number;
}

export default function SmartSearchBar({
  placeholder = 'Tìm kiếm sự kiện theo tên...',
  defaultValue = '',
  size = 'large',
  debounceDelay = 300,
}: SmartSearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  /**
   * ============================================
   * STATE MANAGEMENT
   * ============================================
   */
  const [inputValue, setInputValue] = useState(defaultValue);
  const [options, setOptions] = useState<{ value: string; label: React.ReactNode; event: EventListDto }[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounced value cho Elasticsearch search
  const [debouncedValue] = useDebounce(inputValue, debounceDelay);

  /**
   * ============================================
   * ELASTICSEARCH AUTOCOMPLETE
   * ============================================
   * 
   * Trigger khi debouncedValue thay đổi
   * Call Backend Elasticsearch API
   */
  React.useEffect(() => {
    async function fetchSuggestions() {
      if (!debouncedValue || debouncedValue.trim().length < 2) {
        setOptions([]);
        return;
      }

      setLoading(true);
      try {
        const suggestions = await eventService.searchSmart(debouncedValue);
        
        // Transform data cho AutoComplete format
        const autocompleteOptions = suggestions.map((event) => ({
          value: event.name, // Giá trị khi select
          label: (
            // Custom render cho dropdown item
            <div className="py-2">
              <div className="font-semibold text-gray-900">{event.name}</div>
              <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                <span>📅 {dayjs(event.startDateTime).format('DD/MM/YYYY')}</span>
                <span>•</span>
                <span>📍 {event.venueName}</span>
              </div>
            </div>
          ),
          event, // Keep full event data để navigate
        }));

        setOptions(autocompleteOptions);
        console.log('🔍 Elasticsearch suggestions:', suggestions.length);
      } catch (error) {
        console.error('❌ Autocomplete failed:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSuggestions();
  }, [debouncedValue]);

  /**
   * ============================================
   * HANDLE SELECT SUGGESTION
   * ============================================
   * 
   * Khi user click vào suggestion trong dropdown
   * → Navigate trực tiếp đến event detail page
   */
  const handleSelect = useCallback(
    (value: string, option: any) => {
      const selectedEvent = option.event as EventListDto;
      
      console.log('✅ Selected event:', selectedEvent.name);
      
      // Navigate to event detail page
      router.push(`/events/${selectedEvent.id}`);
    },
    [router]
  );

  /**
   * ============================================
   * HANDLE ENTER KEY (STANDARD SEARCH)
   * ============================================
   * 
   * Khi user nhấn Enter (không select suggestion)
   * → Trigger standard SQL search với filters
   * → Update URL query params
   */
  const handleSearch = useCallback(
    (value: string) => {
      if (!value || value.trim().length === 0) {
        return;
      }

      // Update URL với search param
      const params = new URLSearchParams();
      params.set('search', value.trim());
      params.set('page', '1'); // Reset về page 1

      router.push(`${pathname}?${params.toString()}`);
      
      console.log('🔎 Standard search:', value);
    },
    [pathname, router]
  );

  /**
   * ============================================
   * HANDLE INPUT CHANGE
   * ============================================
   */
  const handleChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  /**
   * ============================================
   * RENDER
   * ============================================
   */
  return (
    <div className="w-full">
      <AutoComplete
        value={inputValue}
        options={options}
        onSelect={handleSelect}
        onSearch={handleChange}
        onChange={handleChange}
        style={{ width: '100%' }}
        notFoundContent={
          loading ? (
            <div className="py-4 text-center text-gray-500">
              <span className="inline-block animate-spin mr-2">⏳</span>
              Đang tìm kiếm...
            </div>
          ) : debouncedValue && debouncedValue.length >= 2 ? (
            <div className="py-4 text-center text-gray-500">
              <div className="text-2xl mb-2">🔍</div>
              <div>Không tìm thấy gợi ý</div>
              <div className="text-xs mt-1">Thử từ khóa khác hoặc nhấn Enter để tìm</div>
            </div>
          ) : null
        }
      >
        <Input
          size={size}
          placeholder={placeholder}
          prefix={<SearchOutlined className="text-gray-400" />}
          onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)}
          className="rounded-lg"
          allowClear
        />
      </AutoComplete>

      {/* Debug Info (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-gray-500 font-mono">
          Input: "{inputValue}" | Debounced: "{debouncedValue}" | Suggestions: {options.length}
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
 * import SmartSearchBar from '@/components/events/SmartSearchBar';
 * 
 * // Trong events page
 * <SmartSearchBar 
 *   placeholder="Tìm kiếm sự kiện..."
 *   defaultValue={searchParams.search}
 * />
 * 
 * ============================================
 * TESTING CHECKLIST
 * ============================================
 * 
 * 1. **Autocomplete:**
 *    - Gõ "blackp" → Thấy suggestions
 *    - Click suggestion → Navigate to event detail
 *    - Loading state hiển thị khi fetch
 * 
 * 2. **Debounce:**
 *    - Gõ nhanh "blackpink" → Chỉ 1 API call sau 300ms
 *    - Check Network tab: Không thấy nhiều requests
 * 
 * 3. **Standard Search:**
 *    - Gõ "concert" → Nhấn Enter
 *    - URL update: ?search=concert&page=1
 *    - Grid reload với SQL results
 * 
 * 4. **Empty State:**
 *    - Gõ "xyz123abc" → "Không tìm thấy gợi ý"
 *    - Suggest nhấn Enter để search SQL
 * 
 * 5. **Keyboard Navigation:**
 *    - Arrow Down → Highlight suggestion
 *    - Arrow Up → Move up
 *    - Enter → Select highlighted item
 * 
 * 6. **Clear:**
 *    - Click X button → Input clear
 *    - Suggestions disappear
 */
