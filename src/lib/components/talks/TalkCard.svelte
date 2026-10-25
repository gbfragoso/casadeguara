<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import InlineEditField from '#lib/components/forms/InlineEditField.svelte';
	import SpeakerField from '#lib/components/talks/SpeakerField.svelte';
	import TalkCardActions from '#lib/components/talks/TalkCardActions.svelte';
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
	};

	let { talk, hoje, isAdmin, readonly = false, palestrantes, move, onUpdate, onDelete }: Props = $props();

	const fieldId = $derived(`palestra-${talk.id}`);
	const schedule = $derived(formatTalkSchedule(talk.data, talk.horario));
	const name = $derived(talk.titulo ?? schedule);

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

{#snippet fieldLabel(icon: string, text: string)}
	<span class="flex items-center gap-1.5 text-sm font-medium text-ink-muted">
		<i class={[icon, 'fa-fw']} aria-hidden="true"></i>{text}
	</span>
{/snippet}

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
			<TalkCardActions id={fieldId} {name} {move} {onDelete} />
		</div>
		<div class="mt-2 flex flex-col gap-3">
			<InlineEditField
				{...fieldProps('titulo')}
				label="Título"
				value={talk.titulo}
				emptyText="Título a definir"
				class="text-lg font-medium text-ink-strong" />
			<div>
				{@render fieldLabel('fa-solid fa-user', 'Palestrante')}
				<SpeakerField
					id={`${fieldId}-palestrante`}
					speaker={talk.palestrante}
					options={palestrantes}
					{readonly}
					onSave={({ campo, valor }) => onUpdate(campo, valor)} />
			</div>
			<div>
				{@render fieldLabel('fa-solid fa-location-dot', 'Local')}
				<InlineEditField {...fieldProps('local')} label="Local" value={talk.local} />
			</div>
			<div>
				{@render fieldLabel('fa-solid fa-align-left', 'Observações')}
				<InlineEditField
					{...fieldProps('observacoes')}
					label="Observações"
					type="textarea"
					value={talk.observacoes} />
			</div>
		</div>
	</div>
</article>
