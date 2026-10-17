export interface CategoryPaginationParams {
  _page?: number;    // backend key: _page  (PageUtil.DEFAULT_NUMBER)
  _limit?: number;   // backend key: _limit (PageUtil.DEFAULT_LIMIT)
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
