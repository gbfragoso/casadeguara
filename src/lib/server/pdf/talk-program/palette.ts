export const PROGRAM_PALETTE = {
	primary: '#006ca5',
	primary700: '#015886',
	primary900: '#012e4a',
	accent: '#ffb70f',
	neutral300: '#c7cddb',
	neutral600: '#505d7c',
	neutral800: '#282f3e',
	neutral900: '#161a22',
} as const;

export type ProgramColor = keyof typeof PROGRAM_PALETTE;
