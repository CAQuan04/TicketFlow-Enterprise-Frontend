/**
 * ============================================
 * EVENT FILTER COMPONENT
 * ============================================
 * 
 * Component: Advanced filters cho events page
 * Purpose: Filter events theo date range, price range, venue, category
 * 
 * ============================================
 * URL STATE MANAGEMENT
 * ============================================
 * 
 * Tất cả filter values được lưu trong URL query params:
 * - ?fromDate=2024-01-01&toDate=2024-12-31
 * - ?minPrice=100000&maxPrice=500000
 * - ?venueId=xxx&categoryId=yyy
 * 
 * Benefits:
 * 1. **Shareable**: User có thể share link với filters
 * 2. **Bookmarkable**: User có thể bookmark filtered results
 * 3. **Back Button**: Browser back giữ nguyên filters
 * 4. **Server-Side**: Filters apply ngay từ server (SEO-friendly)
 * 
 * ============================================
 * DATE HANDLING (UTC)
 * ============================================
 * 
 * ⚠️ CRITICAL: Backend expects UTC ISO 8601 format
 * 
 * Example:
 * - User selects: "30/12/2024" (Local time)
 * - Send to Backend: "2024-12-30T00:00:00.000Z" (UTC)
 * 
 * Why UTC?
 * - Consistent across timezones
 * - Backend stores dates in UTC
 * - Avoid timezone confusion bugs
 * 
 * Implementation:
 * - Use dayjs().startOf('day').toISOString() for fromDate
 * - Use dayjs().endOf('day').toISOString() for toDate
 * 
 * ============================================
 * FILTER TYPES
 * ============================================
 * 
 * 1. **Date Range Picker:**
 *    - Select start date + end date
 *    - Apply to URL: fromDate & toDate
 *    - Clear: Remove both params
 * 
 * 2. **Price Range:**
 *    - Min/Max price inputs
 *    - Apply to URL: minPrice & maxPrice
 *    - Clear: Remove both params
 * 
 * 3. **Venue Filter:**
 *    - Dropdown select venue
 *    - Apply to URL: venueId
 * 
 * 4. **Category Filter:**
 *    - Dropdown select category
 *    - Apply to URL: categoryId
 * 
 * 5. **Clear All Filters:**
 *    - Reset to base URL (no query params)
 *    - Keep search param nếu có
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button, DatePicker, InputNumber, Card, Space, Divider } from 'antd';
import { ClearOutlined, FilterOutlined, CalendarOutlined, DollarOutlined } from '@ant-design/icons';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';

// Enable UTC plugin
dayjs.extend(utc);

const { RangePicker } = DatePicker;

interface EventFilterProps {
  /**
   * Callback khi filters change (optional)
   */
  onFiltersChange?: (filters: FilterValues) => void;
}

export interface FilterValues {
  dateRange?: [string, string]; // [fromDate, toDate] ISO strings
  priceRange?: [number, number]; // [minPrice, maxPrice]
  venueId?: string;
  categoryId?: string;
}

export default function EventFilter({ onFiltersChange }: EventFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * ============================================
   * STATE FROM URL
   * ============================================
   * 
   * Read filter values từ URL query params
   */
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(() => {
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    
    if (fromDate && toDate) {
      return [dayjs(fromDate), dayjs(toDate)];
    }
    return null;
  });

  const [priceRange, setPriceRange] = useState<[number | null, number | null]>(() => {
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    
    return [
      minPrice ? parseInt(minPrice, 10) : null,
      maxPrice ? parseInt(maxPrice, 10) : null,
    ];
  });

  /**
   * ============================================
   * SYNC STATE WITH URL (when URL changes externally)
   * ============================================
   */
  useEffect(() => {
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    
    if (fromDate && toDate) {
      setDateRange([dayjs(fromDate), dayjs(toDate)]);
    } else {
      setDateRange(null);
    }

    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    
    setPriceRange([
      minPrice ? parseInt(minPrice, 10) : null,
      maxPrice ? parseInt(maxPrice, 10) : null,
    ]);
  }, [searchParams]);

  /**
   * ============================================
   * UPDATE URL WITH NEW FILTERS
   * ============================================
   * 
   * Helper function để update URL params
   * - Preserve existing params (search, page, etc.)
   * - Add/Update filter params
   * - Remove null/undefined params
   */
  const updateFilters = useCallback(
    (newFilters: Partial<FilterValues>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Date Range
      if (newFilters.dateRange) {
        params.set('fromDate', newFilters.dateRange[0]);
        params.set('toDate', newFilters.dateRange[1]);
      } else if (newFilters.dateRange === null) {
        params.delete('fromDate');
        params.delete('toDate');
      }

      // Price Range
      if (newFilters.priceRange) {
        params.set('minPrice', newFilters.priceRange[0].toString());
        params.set('maxPrice', newFilters.priceRange[1].toString());
      } else if (newFilters.priceRange === null) {
        params.delete('minPrice');
        params.delete('maxPrice');
      }

      // Venue ID
      if (newFilters.venueId) {
        params.set('venueId', newFilters.venueId);
      } else if (newFilters.venueId === null) {
        params.delete('venueId');
      }

      // Category ID
      if (newFilters.categoryId) {
        params.set('categoryId', newFilters.categoryId);
      } else if (newFilters.categoryId === null) {
        params.delete('categoryId');
      }

      // Reset page về 1 khi filter thay đổi
      params.set('page', '1');

      // Update URL
      router.push(`${pathname}?${params.toString()}`);

      // Callback (optional)
      if (onFiltersChange) {
        const filterValues: FilterValues = {
          dateRange: newFilters.dateRange || undefined,
          priceRange: newFilters.priceRange || undefined,
          venueId: newFilters.venueId || undefined,
          categoryId: newFilters.categoryId || undefined,
        };
        onFiltersChange(filterValues);
      }

      console.log('🔧 Filters updated:', newFilters);
    },
    [pathname, router, searchParams, onFiltersChange]
  );

  /**
   * ============================================
   * HANDLE DATE RANGE CHANGE
   * ============================================
   * 
   * ⚠️ CRITICAL: Convert to UTC ISO strings
   * 
   * User selects local dates → Convert to UTC for Backend
   * Example:
   * - Input: [2024-12-30, 2024-12-31] (Local time)
   * - Output: ["2024-12-30T00:00:00.000Z", "2024-12-31T23:59:59.999Z"]
   */
  const handleDateChange = useCallback(
    (dates: null | [Dayjs | null, Dayjs | null]) => {
      if (!dates || !dates[0] || !dates[1]) {
        // Clear date filter
        setDateRange(null);
        updateFilters({ dateRange: undefined });
        return;
      }

      const [start, end] = dates;

      // Convert to UTC ISO strings
      // fromDate: Start of day UTC
      // toDate: End of day UTC
      const fromDateUTC = start.startOf('day').utc().toISOString();
      const toDateUTC = end.endOf('day').utc().toISOString();

      setDateRange([start, end]);
      updateFilters({ dateRange: [fromDateUTC, toDateUTC] });

      console.log('📅 Date range selected:', {
        local: [start.format('DD/MM/YYYY'), end.format('DD/MM/YYYY')],
        utc: [fromDateUTC, toDateUTC],
      });
    },
    [updateFilters]
  );

  /**
   * ============================================
   * HANDLE PRICE RANGE CHANGE
   * ============================================
   */
  const handlePriceChange = useCallback(
    (type: 'min' | 'max', value: number | null) => {
      const newRange: [number | null, number | null] = [...priceRange];
      
      if (type === 'min') {
        newRange[0] = value;
      } else {
        newRange[1] = value;
      }

      setPriceRange(newRange);

      // Chỉ apply khi cả 2 giá trị đều có
      if (newRange[0] !== null && newRange[1] !== null) {
        updateFilters({ priceRange: newRange as [number, number] });
      }
    },
    [priceRange, updateFilters]
  );

  /**
   * ============================================
   * CLEAR ALL FILTERS
   * ============================================
   * 
   * Reset về URL base (chỉ giữ search param nếu có)
   */
  const handleClearAll = useCallback(() => {
    const params = new URLSearchParams();
    
    // Preserve search param nếu có
    const search = searchParams.get('search');
    if (search) {
      params.set('search', search);
    }

    params.set('page', '1');

    router.push(`${pathname}?${params.toString()}`);

    // Clear local state
    setDateRange(null);
    setPriceRange([null, null]);

    console.log('🗑️ All filters cleared');
  }, [pathname, router, searchParams]);

  /**
   * ============================================
   * CHECK IF ANY FILTER IS ACTIVE
   * ============================================
   */
  const hasActiveFilters = dateRange !== null || priceRange[0] !== null || priceRange[1] !== null;

  /**
   * ============================================
   * RENDER
   * ============================================
   */
  return (
    <Card
      title={
        <Space>
          <FilterOutlined />
          <span>Bộ lọc</span>
        </Space>
      }
      extra={
        hasActiveFilters && (
          <Button
            type="link"
            icon={<ClearOutlined />}
            onClick={handleClearAll}
            size="small"
          >
            Xóa bộ lọc
          </Button>
        )
      }
      className="shadow-sm"
    >
      <Space vertical size="large" style={{ width: '100%' }}>
        {/* DATE RANGE FILTER */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CalendarOutlined className="text-blue-600" />
            <span className="font-semibold text-gray-700">Thời gian</span>
          </div>
          <RangePicker
            value={dateRange}
            onChange={handleDateChange}
            format="DD/MM/YYYY"
            placeholder={['Từ ngày', 'Đến ngày']}
            style={{ width: '100%' }}
            className="rounded-lg"
          />
          {dateRange && (
            <div className="mt-2 text-xs text-gray-500">
              {dayjs(dateRange[0]).format('DD/MM/YYYY')} → {dayjs(dateRange[1]).format('DD/MM/YYYY')}
            </div>
          )}
        </div>

        <Divider className="my-0" />

        {/* PRICE RANGE FILTER */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <DollarOutlined className="text-green-600" />
            <span className="font-semibold text-gray-700">Giá vé (VNĐ)</span>
          </div>
          
          <Space.Compact style={{ width: '100%' }}>
            <InputNumber
              placeholder="Giá tối thiểu"
              value={priceRange[0]}
              onChange={(value) => handlePriceChange('min', value)}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
              style={{ width: '50%' }}
              min={0}
              controls={false}
            />
            <InputNumber
              placeholder="Giá tối đa"
              value={priceRange[1]}
              onChange={(value) => handlePriceChange('max', value)}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
              style={{ width: '50%' }}
              min={0}
              controls={false}
            />
          </Space.Compact>

          {(priceRange[0] !== null || priceRange[1] !== null) && (
            <div className="mt-2 text-xs text-gray-500">
              {priceRange[0] !== null && `Từ ${priceRange[0].toLocaleString('vi-VN')}₫`}
              {priceRange[0] !== null && priceRange[1] !== null && ' - '}
              {priceRange[1] !== null && `đến ${priceRange[1].toLocaleString('vi-VN')}₫`}
            </div>
          )}
        </div>

        {/* TODO: Venue & Category Filters (Optional - add later if Backend supports) */}
        {/* 
        <Divider className="my-0" />
        
        <div>
          <div className="font-semibold text-gray-700 mb-2">Địa điểm</div>
          <Select placeholder="Chọn địa điểm" style={{ width: '100%' }}>
            <Select.Option value="venue1">Sân vận động Mỹ Đình</Select.Option>
            <Select.Option value="venue2">Nhà hát Lớn Hà Nội</Select.Option>
          </Select>
        </div>
        */}
      </Space>
    </Card>
  );
}

/**
 * ============================================
 * USAGE EXAMPLE
 * ============================================
 * 
 * import EventFilter from '@/components/events/EventFilter';
 * 
 * // In events page
 * <EventFilter 
 *   onFiltersChange={(filters) => {
 *     console.log('Filters changed:', filters);
 *   }}
 * />
 * 
 * ============================================
 * TESTING CHECKLIST
 * ============================================
 * 
 * 1. **Date Range:**
 *    - Select dates → URL update với fromDate/toDate
 *    - Check URL params là UTC ISO format
 *    - Clear dates → Params removed
 * 
 * 2. **Price Range:**
 *    - Input min + max → URL update
 *    - Check formatting (comma separators)
 *    - Clear → Params removed
 * 
 * 3. **Clear All:**
 *    - Apply multiple filters
 *    - Click "Xóa bộ lọc"
 *    - All params removed (except search)
 * 
 * 4. **URL Sync:**
 *    - Change URL manually
 *    - Filter UI updates accordingly
 *    - Back button restores filters
 * 
 * 5. **Page Reset:**
 *    - On page 3, apply filter
 *    - URL resets to page=1
 */
