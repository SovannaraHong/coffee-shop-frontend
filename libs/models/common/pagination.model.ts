export interface Pagination {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPage: number;
  last: boolean;
  first: boolean;
  empty: boolean;
  numberOfElements: number;
}
