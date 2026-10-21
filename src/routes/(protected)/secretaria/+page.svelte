<script lang="ts">
	import { resolve } from '$app/paths';
	import Indicator from '#lib/components/data/Indicator.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
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
	dayjs.extend(utc);
	const attendanceLabel = `Frequência no mês ${dayjs.utc(new Date()).format('MM/YYYY')}`;

	const formatAttendanceRate = (attendances: number, workers: number) =>
		((attendances / (workers * MEETINGS_PER_WEEK * WEEKS_PER_MONTH)) * 100).toFixed(2);
</script>

<PageHeader {breadcrumb} icon="fa-solid fa-house">Secretaria</PageHeader>

<div data-testid="indicadores" class="grid gap-4 tablet:grid-cols-2">
	{#await leitores then leitores}
		{#await engajamento}
			<Indicator label="Trabalhadores" icon="fa-solid fa-user" highlight loading />
			<Indicator label={attendanceLabel} icon="fa-solid fa-list-check" loading />
		{:then engajamento}
			<Indicator label="Trabalhadores" icon="fa-solid fa-user" highlight>
				{#snippet value()}{leitores[0].counter}{/snippet}
			</Indicator>
			<Indicator label={attendanceLabel} icon="fa-solid fa-list-check" valueTone="primary">
				{#snippet value()}{formatAttendanceRate(engajamento[0].counter, leitores[0].counter)} %{/snippet}
			</Indicator>
		{/await}
	{/await}
</div>
