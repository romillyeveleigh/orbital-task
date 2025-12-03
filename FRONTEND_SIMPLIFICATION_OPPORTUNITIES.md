# Frontend Code Simplification Opportunities

## Summary
This document identifies areas where the frontend code can be simplified without losing functionality.

---

## 1. **Duplicate Timestamp Formatting Functions** ⚠️ HIGH PRIORITY

**Location:**
- `src/components/UsageTable.tsx` - `formatTimestamp()` (line 19)
- `src/lib/csv.ts` - `formatTimestampForCSV()` (line 12)

**Issue:** Both functions do exactly the same thing - format ISO timestamps to "dd-MM-yyyy HH:mm" in UTC.

**Solution:** Extract to a shared utility function in `src/lib/utils.ts` or `src/lib/dateUtils.ts`:
```typescript
export function formatTimestamp(isoTimestamp: string): string {
  try {
    const date = new Date(isoTimestamp);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return formatInTimeZone(date, 'UTC', 'dd-MM-yyyy HH:mm');
  } catch {
    return 'Invalid date';
  }
}
```

**Impact:** Reduces code duplication, ensures consistency, easier maintenance.

---

## 2. **Unused Utility Function** ⚠️ MEDIUM PRIORITY

**Location:** `src/lib/utils.ts`

**Issue:** The `cn()` function (clsx + tailwind-merge) is exported but never used in the codebase.

**Solution:** 
- Option A: Remove it if not needed
- Option B: Keep it if planning to use it for dynamic class names in the future

**Impact:** Reduces bundle size slightly, cleaner codebase.

---

## 3. **Over-Engineered Table Implementation** ⚠️ MEDIUM PRIORITY

**Location:** `src/components/UsageTable.tsx`

**Issue:** 
- Uses `@tanstack/react-table` but implements manual sorting logic
- The table library is mainly used for rendering headers/rows, but sorting is custom
- `manualSorting: true` is set, meaning the library's sorting is disabled

**Current approach:**
- Uses `useReactTable` for rendering
- Uses custom `useSortState` hook for sorting
- Manually sorts data before passing to table

**Solution Options:**
1. **Remove `@tanstack/react-table` entirely** - Use a simple HTML table with custom sorting (simpler, less dependencies)
2. **Use table library's built-in sorting** - Remove custom sorting logic and use the library's features

**Recommendation:** Option 1 - The table is simple enough that a native HTML table would be cleaner and reduce bundle size.

**Impact:** 
- Reduces bundle size (~15-20KB)
- Simpler code
- One less dependency

---

## 4. **Redundant Date Formatting in Dashboard** ⚠️ LOW PRIORITY

**Location:** `src/components/Dashboard.tsx` (lines 15-36)

**Issue:** The `formatDate` function is created in `useMemo` but:
- Only used once for filename generation (line 87)
- The same formatting logic exists in `CreditsChart` as `formatDateDisplay`

**Solution:** 
- Extract date formatting to a shared utility
- Or inline the format call since it's only used once

**Impact:** Minor simplification, better consistency.

---

## 5. **Multiple Date Formatting Functions in CreditsChart** ⚠️ LOW PRIORITY

**Location:** `src/components/CreditsChart.tsx` (lines 24-34)

**Issue:** Three separate functions for different date formats:
- `formatDateDisplay()` - "dd MMM"
- `formatDateFull()` - "EEEE, dd MMMM yyyy"
- `formatDateKey()` - "yyyy-MM-dd"

**Solution:** Could consolidate into a single function with a format parameter, but current approach is actually quite readable.

**Impact:** Minimal - current code is clear and maintainable.

---

## 6. **Unnecessary BrowserRouter Future Flags** ⚠️ LOW PRIORITY

**Location:** `src/App.tsx` (line 11)

**Issue:** Uses future flags that may not be necessary:
```typescript
<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
```

**Solution:** Remove if not needed, or document why they're needed.

**Impact:** Minor - cleaner code if not needed.

---

## 7. **Complex Date Range Generation** ⚠️ LOW PRIORITY

**Location:** `src/components/CreditsChart.tsx` (lines 36-54)

**Issue:** The `generateDateRange` function manually constructs UTC dates, which is verbose.

**Solution:** Could use `date-fns` utilities more directly, but current implementation is correct and readable.

**Impact:** Minimal - code is correct and clear.

---

## 8. **Unused Export in lib/index.ts** ⚠️ LOW PRIORITY

**Location:** `src/lib/index.ts`

**Issue:** Exports `cn` from utils, but `cn` is never used.

**Solution:** Remove the export if removing `cn` function.

**Impact:** Minor cleanup.

---

## Recommended Action Plan

### High Priority (Do First):
1. ✅ Extract duplicate timestamp formatting to shared utility
2. ✅ Remove unused `cn` function and its export

### Medium Priority (Consider):
3. ⚠️ Simplify table implementation - remove `@tanstack/react-table` dependency
4. ⚠️ Consolidate date formatting utilities

### Low Priority (Nice to Have):
5. Clean up BrowserRouter future flags if not needed
6. Minor code organization improvements

---

## Estimated Impact

**Bundle Size Reduction:**
- Removing `@tanstack/react-table`: ~15-20KB
- Removing unused `cn` utility: ~1-2KB
- **Total potential reduction: ~16-22KB**

**Code Simplification:**
- Remove ~100-150 lines of code
- Reduce dependencies by 1-2
- Improve maintainability

---

## Notes

- The codebase is generally well-structured
- Most simplifications are about reducing duplication and unused code
- The table simplification would have the biggest impact but requires more testing

