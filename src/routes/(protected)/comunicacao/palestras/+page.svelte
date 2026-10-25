<script lang="ts">
	import { resolve } from '$app/paths';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';

	const breadcrumb = [
		{ label: 'Comunicação', href: resolve('comunicacao') },
		{ label: 'Palestras', href: resolve('comunicacao/palestras') },
	];
</script>

<PageHeader {breadcrumb}>Palestras</PageHeader>
