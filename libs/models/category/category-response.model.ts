export interface CategoryResponse {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  imageUrl: string | null;
}
