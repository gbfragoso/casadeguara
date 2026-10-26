<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import InlineNotification from '#lib/components/feedback/InlineNotification.svelte';
	import InlineEditField from '#lib/components/forms/InlineEditField.svelte';
	import SpeakerField from '#lib/components/talks/SpeakerField.svelte';
	import TalkCardActions from '#lib/components/talks/TalkCardActions.svelte';
	import TalkCardDetails from '#lib/components/talks/TalkCardDetails.svelte';
	import TalkFieldLabel from '#lib/components/talks/TalkFieldLabel.svelte';
	import { checkTalkArtReadiness, type TalkArtBlockerCode } from '#lib/talks/art/readiness.js';
	import { formatTalkSchedule } from '#lib/talks/schedule.js';
	import type { SpeakerOption, TalkCard } from '#lib/talks/types.js';
	import { formatCivilDateWithWeekday } from '#lib/utils/date.js';
	import { talkChangeSchema, type TalkChange } from '#lib/validation/comunicacao/palestras.js';

	type SaveResult = { ok: true } | { ok: false; message: string };
	type Props = {
		talk: TalkCard;
		hoje: string;
		isAdmin: boolean;
		readonly?: boolean;
		palestrantes: readonly SpeakerOption[];
		move?: ComponentProps<typeof TalkCardActions>['move'];
		onUpdate: (campo: TalkChange['campo'], valor: string) => Promise<SaveResult>;
		onDelete?: () => Promise<void>;
		onArtStale: () => Promise<void>;
	};

	const DETAILS_BLOCKERS: readonly TalkArtBlockerCode[] = ['local-longo', 'reuniao-com-invalida'];

	let { talk, hoje, isAdmin, readonly = false, palestrantes, move, onUpdate, onDelete, onArtStale }: Props = $props();

	let shownArtBlocker = $state<string | null>(null);
	let detailsOpen = $state(false);

	const fieldId = $derived(`palestra-${talk.id}`);
	const schedule = $derived(formatTalkSchedule(talk.data, talk.horario));
	const name = $derived(talk.titulo ?? schedule);
	const artReadiness = $derived(checkTalkArtReadiness(talk));
	const artBlocker = $derived(artReadiness.ready ? null : artReadiness.blocker.mensagem);
	const art = $derived({
		readiness: artReadiness,
		onBlocked: showArtBlocker,
		onStale: onArtStale,
	});

	function showArtBlocker() {
		shownArtBlocker = artBlocker;
		if (!artReadiness.ready && DETAILS_BLOCKERS.includes(artReadiness.blocker.codigo)) detailsOpen = true;
	}

	const validate = (campo: TalkChange['campo']) => (valor: string) => {
		const parsed = talkChangeSchema.safeParse({ campo, valor });
		return parsed.success ? null : parsed.error.issues[0].message;
	};

	const fieldProps = (campo: TalkChange['campo']) => ({
		id: `${fieldId}-${campo}`,
		readonly,
		validate: validate(campo),
		onSave: (valor: string) => onUpdate(campo, valor),
	});
</script>

<article
	id={fieldId}
	tabindex="-1"
	aria-label={`${schedule} · ${talk.titulo ?? 'Título a definir'}`}
	class="flex rounded-lg border border-divider bg-surface shadow-card">
	{#if move}
		<span
			aria-hidden="true"
			class="flex w-8 shrink-0 cursor-grab justify-center rounded-l-lg border-r border-divider bg-surface-muted pt-5 text-ink-muted active:cursor-grabbing">
			<i class="fa-solid fa-grip-vertical"></i>
		</span>
	{/if}
	<div class="min-w-0 flex-1 p-4 tablet:p-5">
		<div class="flex flex-wrap-reverse items-start justify-end gap-2">
			<div class="flex min-w-56 flex-1 flex-wrap items-center gap-x-3 text-lg font-bold text-primary-ink">
				<InlineEditField
					{...fieldProps('data')}
					label="Data"
					type="date"
					value={talk.data}
					min={isAdmin ? undefined : hoje}
					format={formatCivilDateWithWeekday} />
				<span class="flex items-center gap-x-3">
					<span aria-hidden="true">·</span>
					<InlineEditField {...fieldProps('horario')} label="Horário" type="time" value={talk.horario} />
				</span>
			</div>
			<TalkCardActions id={fieldId} {name} {art} {move} {onDelete} />
		</div>
		{#if artBlocker && shownArtBlocker === artBlocker}
			<InlineNotification kind="warning" element="p" role="alert" class="mt-2 print:hidden">
				{artBlocker}
			</InlineNotification>
		{/if}
		<div class="mt-2 flex flex-col gap-3">
			<InlineEditField
				{...fieldProps('titulo')}
				label="Título"
				value={talk.titulo}
				emptyText="Título a definir"
				class="text-lg font-medium text-ink-strong" />
			<div>
				<TalkFieldLabel icon="fa-solid fa-user" text="Palestrante" />
				<SpeakerField
					id={`${fieldId}-palestrante`}
					speaker={talk.palestrante}
					options={palestrantes}
					{readonly}
					onSave={({ campo, valor }) => onUpdate(campo, valor)} />
			</div>
			<div>
				<TalkFieldLabel icon="fa-solid fa-align-left" text="Observações" />
				<InlineEditField
					{...fieldProps('observacoes')}
					label="Observações"
					type="textarea"
					value={talk.observacoes}
					help="Aparece na arte de divulgação, abaixo do título." />
			</div>
			<TalkCardDetails {talk} {readonly} {fieldProps} bind:open={detailsOpen} />
		</div>
	</div>
</article>
