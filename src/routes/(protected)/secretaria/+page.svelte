<script lang="ts">
	import { resolve } from '$app/paths';
	import Indicator from '#lib/components/data/Indicator.svelte';
	import LoadError from '#lib/components/feedback/LoadError.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { formatMonthYear } from '#lib/utils/date.js';
	import type { PageServerData } from './$types';
	interface Props {
		data: PageServerData;
	}

	const MEETINGS_PER_WEEK = 2;
	const WEEKS_PER_MONTH = 4;

	let { data }: Props = $props();
	let { leitores, engajamento } = $derived(data);
	const breadcrumb = [
		{ label: 'Secretaria', href: resolve('secretaria') },
		{ label: 'Página Inicial', href: resolve('secretaria') },
	];
	const attendanceLabel = `Frequência em ${formatMonthYear(new Date())}`;

	const PERCENT_FORMAT = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

	const formatAttendanceRate = (attendances: number, workers: number) => {
		const expectedAttendances = workers * MEETINGS_PER_WEEK * WEEKS_PER_MONTH;
		const rate = expectedAttendances > 0 ? (attendances / expectedAttendances) * 100 : 0;
		return `${PERCENT_FORMAT.format(rate)} %`;
	};
</script>

<PageHeader {breadcrumb}>Secretaria</PageHeader>

<div data-testid="indicadores" class="grid gap-4 tablet:grid-cols-2">
	{#snippet loadingIndicators()}
		<Indicator label="Trabalhadores" highlight loading />
		<Indicator label={attendanceLabel} loading />
	{/snippet}
	{#snippet loadFailure()}
		<LoadError class="col-span-full" message="Não foi possível carregar os indicadores da secretaria." />
	{/snippet}

	{#await leitores}
		{@render loadingIndicators()}
	{:then leitores}
		{#await engajamento}
			{@render loadingIndicators()}
		{:then engajamento}
			<Indicator label="Trabalhadores" highlight>
				{#snippet value()}{leitores[0].counter}{/snippet}
			</Indicator>
			<Indicator label={attendanceLabel} valueTone="primary">
				{#snippet value()}{formatAttendanceRate(engajamento[0].counter, leitores[0].counter)}{/snippet}
			</Indicator>
		{:catch}
			{@render loadFailure()}
		{/await}
	{:catch}
		{@render loadFailure()}
	{/await}
</div>
