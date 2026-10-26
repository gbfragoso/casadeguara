import sharp from 'sharp';

const PNG_COMPRESSION_LEVEL = 9;

export const rasterizeSvg = async (svg: string): Promise<Uint8Array> =>
	new Uint8Array(
		await sharp(Buffer.from(svg))
			.toColourspace('srgb')
			.withIccProfile('srgb')
			.png({ compressionLevel: PNG_COMPRESSION_LEVEL })
			.toBuffer(),
	);
