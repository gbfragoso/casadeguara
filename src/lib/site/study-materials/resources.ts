import { createPhotoReader } from '../photos.js';
import type { StudyCover, StudyResource, StudySection } from './types.js';

const FILE_URLS = import.meta.glob<string>('./files/*.pdf', { eager: true, query: '?url', import: 'default' });

const readPhoto = createPhotoReader(
	import.meta.glob<string>('../images/material-de-estudo/*.webp', { eager: true, query: '?url', import: 'default' }),
);

const FEB_BASIC_WORKS_URL = 'https://www.febnet.org.br/blog/geral/divulgacao/downloads-divulgacao/obras-basicas/';

export const readStudyFileUrl = (name: string) => {
	const url = FILE_URLS[`./files/${name}.pdf`];
	if (!url) throw new Error(`Missing study file: ${name}`);
	return url;
};

export const studyCover = (name: string, alt: string, largura: number, altura: number): StudyCover => ({
	...readPhoto(name, alt),
	largura,
	altura,
});

export const downloadable = (rotulo: string, file: string, tamanho: string): StudyResource => ({
	kind: 'download',
	rotulo,
	href: readStudyFileUrl(file),
	tamanho,
});

export const externalLink = (rotulo: string, href: string, origem: string): StudyResource => ({
	kind: 'link',
	rotulo,
	href,
	origem,
});

export const youtubeVideo = (rotulo: string, videoId: string) =>
	externalLink(rotulo, `https://www.youtube.com/watch?v=${videoId}`, 'Vídeo no YouTube');

export const febBasicWorks = (rotulo: string) => externalLink(rotulo, FEB_BASIC_WORKS_URL, 'Portal da FEB');

export const libraryBook = (rotulo: string): StudyResource => ({ kind: 'acervo', rotulo });

export const studySection = (section: Partial<StudySection>): StudySection => ({
	titulo: null,
	paragrafos: [],
	capa: null,
	recursos: [],
	numerada: false,
	subsecoes: [],
	...section,
});
