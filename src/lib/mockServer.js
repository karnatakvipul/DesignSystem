/**
 * Simulated Server Handler for offline development & server-side data binding testing.
 */

/**
 * Creates an in-memory mock server endpoint handler.
 *
 * @param {Array} dataset Full master dataset
 * @param {Object} [options]
 * @param {number} [options.delayMs=250] Simulated network latency in milliseconds
 * @param {number} [options.failureRate=0] Probability of simulated HTTP 500 error (0 to 1)
 * @param {Array<string>} [options.searchFields] Fields to check during text search
 * @returns {Function} Async fetcher function ({ page, pageSize, sortKey, sortDirection, search, filters }) => Promise<{ data, total }>
 */
export function createMockServerHandler(dataset = [], options = {}) {
  const {
    delayMs = 250,
    failureRate = 0,
    searchFields = ["account", "name", "site", "key", "status", "type"],
  } = options;

  return async function mockServerFetcher(params = {}) {
    const {
      page = 1,
      pageSize = 10,
      sortKey = null,
      sortDirection = null,
      search = "",
      filters = {},
    } = params;

    // Simulate network delay
    if (delayMs > 0) {
      await new Promise((res) => setTimeout(res, delayMs));
    }

    // Simulate server error if failureRate > 0
    if (failureRate > 0 && Math.random() < failureRate) {
      throw new Error("Simulated Server Error (HTTP 500): Internal Server Failure");
    }

    let records = [...dataset];

    // 1. Server-side Search
    if (search && search.trim() !== "") {
      const q = search.toLowerCase().trim();
      records = records.filter((item) => {
        return searchFields.some((field) => {
          const val = item[field];
          return val != null && String(val).toLowerCase().includes(q);
        });
      });
    }

    // 2. Server-side Filtering
    if (filters && typeof filters === "object") {
      Object.entries(filters).forEach(([key, filterValue]) => {
        if (filterValue === undefined || filterValue === null || filterValue === "" || filterValue === "all") {
          return;
        }
        const valStr = String(filterValue).toLowerCase();
        records = records.filter((item) => {
          const itemVal = item[key];
          if (itemVal == null) return false;
          return String(itemVal).toLowerCase().includes(valStr);
        });
      });
    }

    // 3. Server-side Sorting
    if (sortKey && sortDirection) {
      records.sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

        if (valA == null && valB == null) return 0;
        if (valA == null) return 1;
        if (valB == null) return -1;

        if (typeof valA === "string") {
          return sortDirection === "asc"
            ? valA.localeCompare(String(valB))
            : String(valB).localeCompare(valA);
        }
        return sortDirection === "asc" ? valA - valB : valB - valA;
      });
    }

    // 4. Server-side Pagination Slicing
    const total = records.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedData = records.slice(startIndex, startIndex + pageSize);

    return {
      data: paginatedData,
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / (pageSize || 10)),
    };
  };
}
