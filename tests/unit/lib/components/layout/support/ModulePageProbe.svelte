<script lang="ts">
	import ModuleShell from '#lib/components/layout/ModuleShell.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';

	type Props = { moduleName: string; title: string };

	let { moduleName, title }: Props = $props();
</script>

<ModuleShell items={[]} {moduleName} isAdmin={false} username="Ana Silva" userid="ana-1" canManageUsers={false}>
	<PageHeader breadcrumb={[]} {title} />
</ModuleShell>
