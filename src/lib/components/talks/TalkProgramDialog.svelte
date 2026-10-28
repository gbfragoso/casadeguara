<script lang="ts">
	import Button from '#lib/components/actions/Button.svelte';
	import PdfOutcome from '#lib/components/feedback/PdfOutcome.svelte';
	import SectionHeading from '#lib/components/layout/SectionHeading.svelte';
	import { PdfDelivery } from '#lib/pdf/delivery.svelte.js';
	import { buildProgramFileName, describeReadyProgram } from '#lib/talks/program/format.js';
	import { formatProgramMonthOption, listProgramMonths, type ProgramMonth } from '#lib/talks/program/months.js';
	import { requestTalkProgram, type TalkProgramFailure } from '#lib/talks/program/request.js';
	import { readBahiaIsoDate } from '#lib/utils/date.js';

	type Props = { id: string; hoje: string; fetcher?: typeof fetch };

	let { id, hoje, fetcher = fetch }: Props = $props();

	const program = new PdfDelivery<ProgramMonth, TalkProgramFailure>();
	let dialog = $state<HTMLElement>();
	let openedOn = $state<string>();

	const months = $derived(listProgramMonths(openedOn ?? hoje));
	const chosenMonthKey = $derived(program.current.status === 'idle' ? undefined : program.current.subject.key);

	function chooseMonth(month: ProgramMonth) {
		return program.deliver(month, (signal) => requestTalkProgram(fetcher, month, signal));
	}

	function handleToggle(event: ToggleEvent) {
		if (event.newState === 'open') {
			openedOn = readBahiaIsoDate(new Date());
			dialog?.focus();
			return;
		}
		program.reset();
	}

	const releaseOnUnmount = () => () => program.release();
</script>

{#snippet closeAction()}
	<Button type="button" popovertarget={id} popovertargetaction="hide">Fechar</Button>
{/snippet}

{#snippet pendencies()}
	{#if program.current.status === 'failed' && program.current.pendencias.length > 0}
		<ul class="flex list-disc flex-col gap-1 pl-5">
			{#each program.current.pendencias as pendencia (pendencia.id)}
				<li><span class="font-medium">{pendencia.quando}</span>: {pendencia.falta}</li>
			{/each}
		</ul>
	{/if}
{/snippet}

<div
	{id}
	bind:this={dialog}
	{@attach releaseOnUnmount}
	popover="auto"
	role="dialog"
	tabindex="-1"
	aria-labelledby={`${id}-titulo`}
	ontoggle={handleToggle}
	class="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg flex-col gap-4 overflow-y-auto rounded-xl bg-surface p-4 text-left text-ink shadow-raised backdrop:bg-overlay/60 open:flex tablet:p-6">
	<SectionHeading element="p" id={`${id}-titulo`} icon="fa-solid fa-print">Programação do mês</SectionHeading>
	<div role="group" aria-label="Mês da programação" class="flex flex-col gap-3 tablet:flex-row">
		{#each months as month (month.key)}
			{@const chosen = month.key === chosenMonthKey}
			<Button
				type="button"
				tone={chosen ? 'primary' : 'default'}
				aria-pressed={chosen}
				class="tablet:flex-1"
				onclick={() => chooseMonth(month)}>
				{formatProgramMonthOption(month)}
			</Button>
		{/each}
	</div>
	{#if program.current.status === 'idle'}
		<div class="flex flex-col tablet:flex-row tablet:justify-end">
			{@render closeAction()}
		</div>
	{:else}
		<PdfOutcome
			outcome={program.current}
			loadingLabel="Gerando a programação…"
			readyLabel={describeReadyProgram(program.current.subject)}
			fileName={buildProgramFileName(program.current.subject)}
			details={pendencies}
			actions={closeAction} />
	{/if}
</div>
