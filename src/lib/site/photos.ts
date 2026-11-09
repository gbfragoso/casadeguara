import { groupImageVariants, readResponsiveImage, type ResponsiveImage } from '#lib/image/responsive/variants.js';

export type SitePhoto = ResponsiveImage & { alt: string };

export type PhotoGallery = { titulo: string; fotos: readonly SitePhoto[] };

export const createPhotoReader = (urlsByPath: Record<string, string>) => {
	const images = groupImageVariants(urlsByPath);
	return (name: string, alt: string): SitePhoto => ({ ...readResponsiveImage(images, name), alt });
};
