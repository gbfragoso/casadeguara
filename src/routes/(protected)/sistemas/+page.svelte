<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import AccessCard from '#lib/components/layout/AccessCard.svelte';
	import type { PageServerData } from './$types';

	type Props = { data: PageServerData };
	type ModulePath = 'biblioteca' | 'secretaria' | 'tesouraria';

	let { data }: Props = $props();
	let { roles } = $derived(data);
	const modules: Array<{ role: string; path: ModulePath }> = [
		{ role: 'biblioteca', path: 'biblioteca' },
		{ role: 'secretaria', path: 'secretaria' },
		{ role: 'tesouraria', path: 'tesouraria' },
	];
	let availableModules = $derived(
		modules.filter((module) => roles.some((role) => role.replace(':admin', '') === module.role)),
	);
</script>

<AccessCard>
	<p class="mb-6 text-center text-2xl text-ink-strong">Selecione o módulo</p>
	<div class="flex flex-col gap-3">
		{#each availableModules as module (module.role)}
			<Button href={resolve(module.path)} fullwidth bold class="min-h-12">{module.role}</Button>
		{/each}
	</div>
</AccessCard>
