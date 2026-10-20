export type ColumnSize = 'full' | 'half' | 'one-quarter' | 'three-fifths' | 2 | 3 | 4 | 5 | 10;

export const COLUMN_SIZES: Record<ColumnSize, string> = {
	full: 'flex-[0_1_100%]',
	half: 'flex-[0_1_50%]',
	'one-quarter': 'flex-[0_1_25%]',
	'three-fifths': 'flex-[0_1_60%]',
	2: 'flex-[0_1_16.6667%]',
	3: 'flex-[0_1_25%]',
	4: 'flex-[0_1_33.3333%]',
	5: 'flex-[0_1_41.6667%]',
	10: 'flex-[0_1_83.3333%]',
};

export const TABLET_COLUMN_SIZES: Record<ColumnSize, string> = {
	full: 'tablet:flex-[0_1_100%]',
	half: 'tablet:flex-[0_1_50%]',
	'one-quarter': 'tablet:flex-[0_1_25%]',
	'three-fifths': 'tablet:flex-[0_1_60%]',
	2: 'tablet:flex-[0_1_16.6667%]',
	3: 'tablet:flex-[0_1_25%]',
	4: 'tablet:flex-[0_1_33.3333%]',
	5: 'tablet:flex-[0_1_41.6667%]',
	10: 'tablet:flex-[0_1_83.3333%]',
};

export const MOBILE_COLUMN_SIZES: Record<ColumnSize, string> = {
	full: 'max-tablet:flex-[0_1_100%]',
	half: 'max-tablet:flex-[0_1_50%]',
	'one-quarter': 'max-tablet:flex-[0_1_25%]',
	'three-fifths': 'max-tablet:flex-[0_1_60%]',
	2: 'max-tablet:flex-[0_1_16.6667%]',
	3: 'max-tablet:flex-[0_1_25%]',
	4: 'max-tablet:flex-[0_1_33.3333%]',
	5: 'max-tablet:flex-[0_1_41.6667%]',
	10: 'max-tablet:flex-[0_1_83.3333%]',
};
