import { Tone } from '../../../../../libs/models/category/category.model';

/** Soft coloured tile classes used for category / product icons. */
const TILE: Record<Tone, string> = {
  orange: 'bg-orange-100 text-orange-600',
  amber: 'bg-amber-100 text-amber-600',
  sky: 'bg-sky-100 text-sky-600',
  green: 'bg-emerald-100 text-emerald-600',
  rose: 'bg-rose-100 text-rose-600',
  violet: 'bg-violet-100 text-violet-600',
};

export const tileClass = (tone: Tone | undefined): string => TILE[tone ?? 'orange'];
export const TONE_LIST = Object.keys(TILE) as Tone[];
