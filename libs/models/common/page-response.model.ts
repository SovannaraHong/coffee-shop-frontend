import { Pagination } from './pagination.model';

export interface PageResponse<T> {
  list: T[];
  paginationDTO: Pagination;
}
