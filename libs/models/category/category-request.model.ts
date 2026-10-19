import { Tone } from './category.model';

export interface CategoryRequest {
  id?: number;
  name: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  icon?: string;
  tone?: Tone;
}

export interface CategoryFormSubmit {
  request: CategoryRequest;
  imageFile: File | null;
}
export interface CategoryFormSubmit {
  request: CategoryRequest;
  imageFile: File | null;
}
