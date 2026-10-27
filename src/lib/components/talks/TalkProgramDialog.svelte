<script lang="ts">
	import Button from '#lib/components/actions/Button.svelte';
	import SectionHeading from '#lib/components/layout/SectionHeading.svelte';
	import TalkProgramOutcome, { type ActiveProgram } from '#lib/components/talks/TalkProgramOutcome.svelte';
	import { buildProgramFileName } from '#lib/talks/program/format.js';
	import { formatProgramMonthOption, listProgramMonths, type ProgramMonth } from '#lib/talks/program/months.js';
	import { requestTalkProgram } from '#lib/talks/program/request.js';
	import { readBahiaIsoDate } from '#lib/utils/date.js';

	type ProgramState = { status: 'idle' } | ActiveProgram;
	type Props = { id: string; hoje: string; fetcher?: typeof fetch };

	let { id, hoje, fetcher = fetch }: Props = $props();

	let program = $state.raw<ProgramState>({ status: 'idle' });
	let dialog = $state<HTMLElement>();
	let openedOn = $state<string>();
	let controller: AbortController | undefined;

	const months = $derived(listProgramMonths(openedOn ?? hoje));
	const chosenMonthKey = $derived(program.status === 'idle' ? undefined : program.month.key);

	function releaseProgram() {
		controller?.abort();
		controller = undefined;
		if (program.status === 'ready') URL.revokeObjectURL(program.url);
	}

	async function chooseMonth(month: ProgramMonth) {
		releaseProgram();
		const request = new AbortController();
		controller = request;
		program = { status: 'loading', month };
		const result = await requestTalkProgram(fetcher, month, request.signal);
		if (request.signal.aborted) return;

		program = result.ok
			? { status: 'ready', month, url: URL.createObjectURL(result.pdf) }
			: { status: 'blocked', month, message: result.message, pendencias: result.pendencias };
	}

	function handleToggle(event: ToggleEvent) {
		if (event.newState === 'open') {
			openedOn = readBahiaIsoDate(new Date());
			dialog?.focus();
			return;
		}
		releaseProgram();
		program = { status: 'idle' };
	}

	const releaseOnUnmount = () => releaseProgram;
</script>

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
	{#if program.status === 'idle'}
		<div class="flex flex-col tablet:flex-row tablet:justify-end">
			<Button type="button" popovertarget={id} popovertargetaction="hide">Fechar</Button>
		</div>
	{:else}
		<TalkProgramOutcome {program} fileName={buildProgramFileName(program.month)} popoverId={id} />
	{/if}
</div>
