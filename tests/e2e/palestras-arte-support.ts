import type { Page } from '@playwright/test';

import { createPhoto } from './amigo-fraterno-support';
import type { E2EData } from './fixtures';
import { talkCard } from './palestras-browser';

export const ART_SIZE_PX = 1080;
export const ART_TIME = '19:30';
export const ART_WEEKDAY_OFFSET = 0;

export const artTitle = (e2e: E2EData) => `${e2e.token} arte`;

export const speakerName = (e2e: E2EData) => `Palestrante arte ${e2e.token}`;

export const artDate = (e2e: E2EData) => e2e.talkDate(ART_WEEKDAY_OFFSET);

export const artFileName = (e2e: E2EData) => `palestra-${artDate(e2e)}-${ART_TIME.replace(':', '')}.png`;

export const seedReadyTalk = async (e2e: E2EData, data = artDate(e2e)) => {
	const [talk] = await e2e.createTalks([{ titulo: artTitle(e2e), data, horario: ART_TIME }]);
	const speakerId = await e2e.createSpeaker({ nome: speakerName(e2e), photo: await createPhoto() });
	await e2e.assignSpeaker(talk.id, speakerId);
	return talk;
};

export const openReadyCard = async (page: Page, e2e: E2EData) => {
	await seedReadyTalk(e2e);
	await e2e.authenticate(page, 'comunicacao');
	return talkCard(page, artTitle(e2e));
};
