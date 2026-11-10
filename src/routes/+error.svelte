<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { formatDocumentTitle } from '#lib/brand/document-title.js';
	import Button from '#lib/components/actions/Button.svelte';
	import AccessCard from '#lib/components/layout/AccessCard.svelte';
	import { describeErrorMessage, isServerFailure } from '#lib/errors/error-page.js';

	let message = $derived(describeErrorMessage(page.status, page.error?.message));
</script>

<svelte:head>
	<title>{formatDocumentTitle(`Erro ${page.status}`)}</title>
</svelte:head>

<AccessCard>
	<p class="text-center text-4xl font-bold text-primary-ink">{page.status}</p>
	<div class="mt-2 text-center text-ink">
		<p>{message}</p>
	</div>
	<div class="mt-6 flex flex-col gap-3">
		{#if isServerFailure(page.status)}
			<Button tone="primary" fullwidth bold onclick={() => window.location.reload()}>Tentar novamente</Button>
		{/if}
		<Button href={resolve('sistemas')} fullwidth>Ir para a página inicial</Button>
	</div>
</AccessCard>
