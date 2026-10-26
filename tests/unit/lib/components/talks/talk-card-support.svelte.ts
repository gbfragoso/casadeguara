import type { ComponentProps } from 'svelte';
import { vi } from 'vitest';

import TalkCard from '#lib/components/talks/TalkCard.svelte';
import { buildTalk, speakers } from './talk-fixtures';

type CardProps = ComponentProps<typeof TalkCard>;

export const createCardProps = (props: Partial<CardProps> = {}) => {
	const cardProps = $state<CardProps>({
		talk: buildTalk(),
		hoje: '2026-03-01',
		isAdmin: false,
		palestrantes: speakers,
		onUpdate: vi.fn<CardProps['onUpdate']>(() => Promise.resolve({ ok: true })),
		onArtStale: vi.fn(() => Promise.resolve()),
		...props,
	});
	return cardProps;
};
