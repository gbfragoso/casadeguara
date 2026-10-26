<script lang="ts">
	import { tick } from 'svelte';
	import { flip } from 'svelte/animate';
	import { fromAction } from 'svelte/attachments';
	import { MediaQuery } from 'svelte/reactivity';
	import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME, type DndEvent } from 'svelte-dnd-action';
	import ErrorMessage from '#lib/components/forms/ErrorMessage.svelte';
	import TalkCard from '#lib/components/talks/TalkCard.svelte';
	import { deleteTalk, sendTalkRequest, updateTalkField, type TalkRequestContext } from '#lib/talks/requests.js';
	import { formatTalkSchedule } from '#lib/talks/schedule.js';
	import { planSlotMove } from '#lib/talks/slot-move.js';
	import type { MoveDirection, SpeakerOption, TalkCard as Talk } from '#lib/talks/types.js';

	type Props = {
		talks: Talk[];
		hoje: string;
		isAdmin: boolean;
		palestrantes: readonly SpeakerOption[];
		context: TalkRequestContext;
	};

	const FLIP_DURATION_MS = 150;
	const LONG_PRESS_DELAY_MS = 400;
	const MOVE_FAILURE_MESSAGE = 'Não foi possível trocar as datas. Nada foi alterado.';

	let { talks, hoje, isAdmin, palestrantes, context }: Props = $props();

	let items = $derived(talks);
	let moving = $state(false);
	let editing = $state(false);
	let announcement = $state('');
	let moveError = $state('');
	let board = $state<HTMLOListElement>();

	const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)');
	const flipDurationMs = $derived(reducedMotion.current ? 0 : FLIP_DURATION_MS);
	const dndOptions = $derived({
		items,
		flipDurationMs,
		dragDisabled: moving || editing,
		dropAnimationDisabled: reducedMotion.current,
		delayTouchStart: LONG_PRESS_DELAY_MS,
		autoAriaDisabled: true,
		zoneTabIndex: -1,
		zoneItemTabIndex: -1,
		dropTargetStyle: {},
	});

	const isTextEntry = (target: EventTarget | null) =>
		target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

	const buildMoveFields = (range: readonly Talk[], origin: Talk, target: Talk) => ({
		origemId: `${origin.id}`,
		destinoId: `${target.id}`,
		ids: range.map(({ id }) => `${id}`),
		versoes: range.map(({ versao }) => `${versao}`),
	});

	async function focusMovedCard(id: number, control: MoveDirection) {
		await tick();
		const card = board?.querySelector<HTMLElement>(`#palestra-${id}`);
		const button = card?.querySelector<HTMLButtonElement>(`[data-move="${control}"]`);
		if (button && !button.disabled) button.focus();
		else card?.focus();
	}

	async function moveTalk(originIndex: number, targetIndex: number, control?: MoveDirection) {
		const origin = talks.at(originIndex);
		const target = talks.at(targetIndex);
		if (!origin || !target || originIndex === targetIndex) {
			items = talks;
			return;
		}

		const start = Math.min(originIndex, targetIndex);
		const range = talks.slice(start, Math.max(originIndex, targetIndex) + 1);
		const planned = planSlotMove(range, originIndex - start, targetIndex - start);
		items = talks.toSpliced(start, range.length, ...planned);
		moving = true;
		moveError = '';
		const fields = buildMoveFields(range, origin, target);
		const result = await sendTalkRequest(context, '?/mover', fields, MOVE_FAILURE_MESSAGE);
		moving = false;
		if (!result.ok) {
			items = talks;
			if (!result.stale) moveError = MOVE_FAILURE_MESSAGE;
			return;
		}

		const moved = planned.find(({ id }) => id === origin.id) ?? origin;
		announcement = `«${moved.titulo ?? 'Palestra sem título'}» agora em ${formatTalkSchedule(moved.data, moved.horario)}`;
		if (control) await focusMovedCard(origin.id, control);
	}

	function handleConsider(event: CustomEvent<DndEvent<Talk>>) {
		items = event.detail.items;
	}

	function handleFinalize(event: CustomEvent<DndEvent<Talk>>) {
		items = event.detail.items;
		const movedId = String(event.detail.info.id);
		const isMoved = (talk: Talk) => String(talk.id) === movedId;
		void moveTalk(talks.findIndex(isMoved), items.findIndex(isMoved));
	}

	const moveControls = (index: number) => ({
		canMoveUp: index > 0,
		canMoveDown: index < items.length - 1,
		disabled: moving,
		onMove: (direction: MoveDirection) => moveTalk(index, direction === 'up' ? index - 1 : index + 1, direction),
	});
</script>

{#if moveError}
	<ErrorMessage class="mb-3" role="alert">{moveError}</ErrorMessage>
{/if}
<p class="sr-only" role="status">{announcement}</p>
<ol
	bind:this={board}
	{@attach fromAction(dndzone, () => dndOptions)}
	aria-label="Agenda de palestras"
	class="flex flex-col gap-3"
	onconsider={handleConsider}
	onfinalize={handleFinalize}
	onfocusin={(event) => (editing = isTextEntry(event.target))}
	onfocusout={() => (editing = false)}>
	{#each items as talk, index (talk.id)}
		<li class="relative" animate:flip={{ duration: flipDurationMs }}>
			<TalkCard
				{talk}
				{hoje}
				{isAdmin}
				{palestrantes}
				move={moveControls(index)}
				onUpdate={(campo, valor) => updateTalkField(context, talk, campo, valor)}
				onDelete={isAdmin ? () => deleteTalk(context, talk.id) : undefined}
				onArtStale={context.refresh} />
			{#if SHADOW_ITEM_MARKER_PROPERTY_NAME in talk}
				<div
					aria-hidden="true"
					class="visible absolute inset-0 rounded-lg border-2 border-dashed border-primary-ink/50 bg-primary-soft">
				</div>
			{/if}
		</li>
	{/each}
</ol>
