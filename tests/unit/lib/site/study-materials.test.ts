import { readdirSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { STUDY_MATERIAL_SLUGS, findStudyMaterial } from '#lib/site/study-materials/index.js';
import { readStudyFileUrl } from '#lib/site/study-materials/resources.js';
import type { StudyResource, StudySection } from '#lib/site/study-materials/types.js';

const FILES_DIRECTORY = 'src/lib/site/study-materials/files';
const BYTES_PER_MEGABYTE = 1_000_000;
const BYTES_PER_KILOBYTE = 1_000;

const flattenSections = (sections: readonly StudySection[]): StudySection[] =>
	sections.flatMap((section) => [section, ...flattenSections(section.subsecoes)]);

const SECTIONS = STUDY_MATERIAL_SLUGS.flatMap((slug) => flattenSections(findStudyMaterial(slug).secoes));

const RESOURCES = SECTIONS.flatMap((section) => section.recursos);

const DOWNLOADS = RESOURCES.filter(
	(resource): resource is Extract<StudyResource, { kind: 'download' }> => resource.kind === 'download',
);

const formatFileSize = (bytes: number) =>
	bytes < BYTES_PER_MEGABYTE
		? `${Math.round(bytes / BYTES_PER_KILOBYTE)} KB`
		: `${(bytes / BYTES_PER_MEGABYTE).toFixed(1).replace('.', ',')} MB`;

describe('study materials', () => {
	it('offers every copied PDF from the app', () => {
		const offered = DOWNLOADS.map((download) => basename(download.href)).sort();

		expect(offered).toEqual(readdirSync(FILES_DIRECTORY).sort());
	});

	it('states the size of each PDF', () => {
		const sizes = DOWNLOADS.map((download) => [
			basename(download.href),
			formatFileSize(statSync(join(FILES_DIRECTORY, basename(download.href))).size),
		]);

		expect(DOWNLOADS.map((download) => [basename(download.href), download.tamanho])).toEqual(sizes);
	});

	it('loads nothing from the old site', () => {
		const addresses = [
			...RESOURCES.flatMap((resource) => ('href' in resource ? [resource.href] : [])),
			...SECTIONS.flatMap((section) => (section.capa ? [section.capa.src] : [])),
		];

		expect(addresses.filter((address) => address.includes('casadeguara.org'))).toEqual([]);
	});

	it('describes every book cover', () => {
		const covers = SECTIONS.flatMap((section) => (section.capa ? [section.capa] : []));

		expect(covers).toHaveLength(4);
		expect(covers.filter((cover) => !cover.src.endsWith('.webp') || cover.alt.trim() === '')).toEqual([]);
	});

	it('links the eighteen qualification videos in order', () => {
		const course = findStudyMaterial('atendimento-fraterno').secoes[1];

		expect(course.numerada).toBe(true);
		expect(course.recursos).toHaveLength(18);
		expect(course.recursos[0]).toEqual({
			kind: 'link',
			rotulo: 'Introdução',
			href: 'https://www.youtube.com/watch?v=sZ5NnqEH0x0',
			origem: 'Vídeo no YouTube',
		});
	});

	it('rejects a study file that was not copied', () => {
		expect(() => readStudyFileUrl('inexistente')).toThrow('Missing study file: inexistente');
	});
});
