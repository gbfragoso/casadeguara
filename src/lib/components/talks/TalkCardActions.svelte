<script lang="ts">
	import Button from '#lib/components/actions/Button.svelte';
	import IconAction from '#lib/components/actions/IconAction.svelte';
	import SectionHeading from '#lib/components/layout/SectionHeading.svelte';
	import type { MoveDirection } from '#lib/talks/types.js';

	type MoveControls = {
		canMoveUp: boolean;
		canMoveDown: boolean;
		disabled: boolean;
		onMove: (direction: MoveDirection) => void;
	};

	type Props = {
		id: string;
		name: string;
		move?: MoveControls;
		onDelete?: () => Promise<void>;
	};

	let { id, name, move, onDelete }: Props = $props();

	const confirmationId = $derived(`${id}-excluir`);
</script>

<div class="flex shrink-0 items-center gap-1 print:hidden">
	{#if move}
		<IconAction
			icon="fa-solid fa-arrow-up"
			size="large"
			data-move="up"
			aria-label={`Mover para cima: ${name}`}
			title="Mover para cima"
			disabled={move.disabled || !move.canMoveUp}
			onclick={() => move.onMove('up')} />
		<IconAction
			icon="fa-solid fa-arrow-down"
			size="large"
			data-move="down"
			aria-label={`Mover para baixo: ${name}`}
			title="Mover para baixo"
			disabled={move.disabled || !move.canMoveDown}
			onclick={() => move.onMove('down')} />
	{/if}
	{#if onDelete}
		<IconAction
			icon="fa-regular fa-trash-can"
			tone="danger"
			size="large"
			popovertarget={confirmationId}
			aria-label={`Excluir palestra: ${name}`}
			title="Excluir" />
		<div
			id={confirmationId}
			popover="auto"
			role="dialog"
			aria-labelledby={`${confirmationId}-titulo`}
			class="m-auto w-[calc(100%-2rem)] max-w-lg flex-col gap-4 rounded-xl bg-surface p-6 text-left text-ink shadow-raised backdrop:bg-overlay/60 open:flex">
			<SectionHeading element="p" id={`${confirmationId}-titulo`} icon="fa-solid fa-trash-can" iconTone="danger">
				Excluir palestra
			</SectionHeading>
			<p class="wrap-anywhere">Confirma a exclusão da palestra “{name}”? Esta ação não pode ser desfeita.</p>
			<div class="mt-2 flex flex-col-reverse gap-3 tablet:flex-row tablet:justify-end">
				<Button type="button" popovertarget={confirmationId} popovertargetaction="hide">Cancelar</Button>
				<Button
					tone="danger"
					type="button"
					popovertarget={confirmationId}
					popovertargetaction="hide"
					aria-label={`Confirmar exclusão da palestra ${name}`}
					onclick={onDelete}>Excluir</Button>
			</div>
		</div>
	{/if}
</div>
