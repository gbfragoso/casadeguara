<script lang="ts">
	import { resolve } from '$app/paths';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';

	const breadcrumb = [
		{ label: 'Comunicação', href: resolve('comunicacao') },
		{ label: 'Palestrantes', href: resolve('comunicacao/palestrantes') },
	];
</script>

<PageHeader {breadcrumb}>Palestrantes</PageHeader>
