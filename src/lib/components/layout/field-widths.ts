export const FIELD_WIDTHS = {
	wide: 'grow-3 min-w-56',
	medium: 'grow-2 min-w-56',
	regular: 'min-w-40',
	narrow: 'min-w-24',
} as const;

export type FieldWidth = keyof typeof FIELD_WIDTHS;
