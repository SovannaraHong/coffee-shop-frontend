export interface ProductPaginationParams {
  page?: number;
  _page?: number;
  size?: number;
  _limit?: number;
  search?: string;
  categoryId?: number;
  isActive?: boolean;
  featured?: boolean;
  sort?: string;
}
