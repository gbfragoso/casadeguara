import { clip, endPath, popGraphicsState, pushGraphicsState, rectangle, type PDFImage, type PDFPage } from 'pdf-lib';

import { PDF_COLORS } from './layout';

export type PhotoFrame = { x: number; y: number; width: number; height: number };
export type PhotoPlacement = PhotoFrame;

export const calculateCoverPlacement = (imageWidth: number, imageHeight: number, frame: PhotoFrame): PhotoPlacement => {
	const scale = Math.max(frame.width / imageWidth, frame.height / imageHeight);
	const width = imageWidth * scale;
	const height = imageHeight * scale;
	return {
		x: frame.x + (frame.width - width) / 2,
		y: frame.y + (frame.height - height) / 2,
		width,
		height,
	};
};

const clipToFrame = (page: PDFPage, frame: PhotoFrame) =>
	page.pushOperators(pushGraphicsState(), rectangle(frame.x, frame.y, frame.width, frame.height), clip(), endPath());

const drawClippedImage = (page: PDFPage, image: PDFImage, frame: PhotoFrame) => {
	const placement = calculateCoverPlacement(image.width, image.height, frame);
	clipToFrame(page, frame);
	try {
		page.drawImage(image, placement);
	} finally {
		page.pushOperators(popGraphicsState());
	}
};

export const drawPhoto = async (page: PDFPage, photo: Uint8Array | null, frame: PhotoFrame) => {
	if (photo) {
		const image = await page.doc.embedJpg(photo);
		drawClippedImage(page, image, frame);
	}
	page.drawRectangle({ ...frame, borderColor: PDF_COLORS.black, borderWidth: 0.75 });
};
