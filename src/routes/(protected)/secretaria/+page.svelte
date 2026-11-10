<script lang="ts">
	import { resolve } from '$app/paths';
	import Indicator from '#lib/components/data/Indicator.svelte';
	import LoadError from '#lib/components/feedback/LoadError.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import type { PageServerData } from './$types';
	interface Props {
		data: PageServerData;
	}

	let { data }: Props = $props();
	let { leitores } = $derived(data);
	const breadcrumb = [
		{ label: 'Secretaria', href: resolve('secretaria') },
		{ label: 'Página Inicial', href: resolve('secretaria') },
	];
</script>

<PageHeader {breadcrumb} title="Secretaria" />

<div data-testid="indicadores" class="grid gap-4 tablet:grid-cols-2">
	{#await leitores}
		<Indicator label="Trabalhadores" highlight loading />
	{:then leitores}
		<Indicator label="Trabalhadores" highlight>
			{#snippet value()}{leitores[0].counter}{/snippet}
		</Indicator>
	{:catch}
		<LoadError class="col-span-full" message="Não foi possível carregar os indicadores da secretaria." />
	{/await}
</div>
