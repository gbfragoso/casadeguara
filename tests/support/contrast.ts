const HEX_COLOR = /^#[\da-f]{6}$/i;
const CHANNEL_OFFSETS = [1, 3, 5] as const;
const LUMINANCE_WEIGHTS = [0.2126, 0.7152, 0.0722] as const;
const MAX_CHANNEL_VALUE = 255;
const LINEAR_SEGMENT_LIMIT = 0.04045;
const LINEAR_SEGMENT_DIVISOR = 12.92;
const GAMMA_OFFSET = 0.055;
const GAMMA_EXPONENT = 2.4;
const CONTRAST_FLARE = 0.05;

export const readRgbChannels = (hex: string) => {
	if (!HEX_COLOR.test(hex)) throw new Error(`Expected a 6-digit hexadecimal color, received ${hex}.`);
	return CHANNEL_OFFSETS.map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / MAX_CHANNEL_VALUE);
};

const linearize = (channel: number) =>
	channel <= LINEAR_SEGMENT_LIMIT
		? channel / LINEAR_SEGMENT_DIVISOR
		: ((channel + GAMMA_OFFSET) / (1 + GAMMA_OFFSET)) ** GAMMA_EXPONENT;

export const relativeLuminance = (hex: string) =>
	readRgbChannels(hex).reduce((total, channel, index) => total + LUMINANCE_WEIGHTS[index] * linearize(channel), 0);

export const contrastRatio = (first: string, second: string) => {
	const [lighter, darker] = [relativeLuminance(first), relativeLuminance(second)].sort((a, b) => b - a);
	return (lighter + CONTRAST_FLARE) / (darker + CONTRAST_FLARE);
};
