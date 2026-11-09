export type ResponsiveImage = { src: string; srcset: string };

type ImageVariant = { name: string; width: number; url: string };

const VARIANT_FILE = /\/([^/]+)-(\d+)\.webp$/;

const parseVariant = ([path, url]: [string, string]): ImageVariant => {
	const match = VARIANT_FILE.exec(path);
	if (!match) throw new Error(`Image variant without a width suffix: ${path}`);
	return { name: match[1], width: Number(match[2]), url };
};

const toResponsiveImage = (variants: readonly ImageVariant[]): ResponsiveImage => {
	const byWidth = [...variants].sort((first, second) => first.width - second.width);
	return {
		src: byWidth[byWidth.length - 1].url,
		srcset: byWidth.map(({ url, width }) => `${url} ${width}w`).join(', '),
	};
};

export const groupImageVariants = (urlsByPath: Record<string, string>) => {
	const variantsByName = Object.entries(urlsByPath)
		.map(parseVariant)
		.reduce(
			(groups, variant) => groups.set(variant.name, [...(groups.get(variant.name) ?? []), variant]),
			new Map<string, ImageVariant[]>(),
		);
	return new Map([...variantsByName].map(([name, variants]) => [name, toResponsiveImage(variants)]));
};

export const readResponsiveImage = (images: ReadonlyMap<string, ResponsiveImage>, name: string) => {
	const image = images.get(name);
	if (!image) throw new Error(`Missing image: ${name}`);
	return image;
};
