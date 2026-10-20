<script lang="ts">
	import { page } from '$app/state';
	import AccessCard from '#lib/components/layout/AccessCard.svelte';
</script>

<AccessCard>
	<p class="text-center text-4xl font-bold text-primary-ink">{page.status}</p>
	<div class="mt-2 text-center text-ink">
		{#if page.status === 404}
			<p>{page.error?.message ?? 'Página não encontrada'}</p>
		{:else}
			<p>{page.error?.message}</p>
		{/if}
	</div>
</AccessCard>
