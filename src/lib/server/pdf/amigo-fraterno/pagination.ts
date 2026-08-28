import { CARDS_PER_PAGE, createCardSlots, type CardSlot } from '$lib/image/geometry/card';

export type NumberedParticipant<T> = T & { number: string };
export type CardPage<T> = Array<{ participant: NumberedParticipant<T>; slot: CardSlot }>;

export const numberParticipants = <T>(participants: T[]): NumberedParticipant<T>[] =>
	participants.map((participant, index) => ({ ...participant, number: String(index + 1).padStart(2, '0') }));

export const paginateCards = <T>(participants: NumberedParticipant<T>[]): CardPage<T>[] => {
	const slots = createCardSlots();
	return Array.from({ length: Math.ceil(participants.length / CARDS_PER_PAGE) }, (_, pageIndex) =>
		participants
			.slice(pageIndex * CARDS_PER_PAGE, (pageIndex + 1) * CARDS_PER_PAGE)
			.map((participant, slotIndex) => ({
				participant,
				slot: slots[slotIndex],
			})),
	);
};
