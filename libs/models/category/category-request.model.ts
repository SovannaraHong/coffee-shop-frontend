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
