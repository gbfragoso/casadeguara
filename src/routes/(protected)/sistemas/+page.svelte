<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import AccessCard from '#lib/components/layout/AccessCard.svelte';
	import type { PageServerData } from './$types';

	type Props = { data: PageServerData };
	type ModulePath = 'biblioteca' | 'secretaria' | 'tesouraria';

	let { data }: Props = $props();
	let { roles } = $derived(data);
	const modules: Array<{ role: string; path: ModulePath; label: string; icon: string }> = [
		{ role: 'biblioteca', path: 'biblioteca', label: 'Biblioteca', icon: 'fa-solid fa-book' },
		{ role: 'secretaria', path: 'secretaria', label: 'Secretaria', icon: 'fa-solid fa-address-book' },
		{ role: 'tesouraria', path: 'tesouraria', label: 'Tesouraria', icon: 'fa-solid fa-sack-dollar' },
	];
	let availableModules = $derived(
		modules.filter((module) => roles.some((role) => role.replace(':admin', '') === module.role)),
	);
</script>

<AccessCard>
	<h1 class="mb-6 text-center text-2xl font-medium text-balance text-ink-strong">Selecione o módulo</h1>
	<div class="flex flex-col gap-3">
		{#each availableModules as module (module.role)}
			<Button href={resolve(module.path)} fullwidth bold class="min-h-12">
				<i class={[module.icon, 'fa-fw text-primary-ink']} aria-hidden="true"></i>{module.label}
			</Button>
		{:else}
			<p role="status" class="text-center text-ink">
				Seu usuário ainda não tem acesso a nenhum módulo. Peça à coordenação do seu setor para liberar o acesso.
			</p>
		{/each}
	</div>
</AccessCard>
