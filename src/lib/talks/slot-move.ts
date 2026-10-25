export type TalkSlot = { data: string; horario: string };
export type SlottedTalk = TalkSlot & { id: number };

/** range: trecho contíguo da agenda em ordem crescente; origem e destino são as pontas. */
export function planSlotMove<Talk extends SlottedTalk>(
	range: readonly Talk[],
	originIndex: number,
	targetIndex: number,
): Talk[] {
	const origin = range[originIndex];
	const reordered = range.toSpliced(originIndex, 1).toSpliced(targetIndex, 0, origin);

	return reordered.map((talk, index) => ({ ...talk, data: range[index].data, horario: range[index].horario }));
}
