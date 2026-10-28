import { BRAND_FONT_CAP_HEIGHT } from '#lib/server/brand/font-metrics.js';
import type { SheetTextStyle } from './elements';

type LineBox = Pick<SheetTextStyle, 'size' | 'lineHeight'>;

const measureCapHeight = (size: number) => size * BRAND_FONT_CAP_HEIGHT;

export const computeLineHeight = (size: number, lineGap: number) => measureCapHeight(size) + lineGap;

export const measureBaselineOffset = ({ size, lineHeight }: LineBox) => (lineHeight + measureCapHeight(size)) / 2;
