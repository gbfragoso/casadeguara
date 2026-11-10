<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatDocumentTitle } from '#lib/brand/document-title.js';
	import Button from '#lib/components/actions/Button.svelte';
	import AccessCard from '#lib/components/layout/AccessCard.svelte';
	import { listAccessibleModules } from '#lib/navigation/system-modules.js';
	import type { PageServerData } from './$types';

	type Props = { data: PageServerData };

	let { data }: Props = $props();
	let availableModules = $derived(listAccessibleModules(data.roles));
</script>

<svelte:head>
	<title>{formatDocumentTitle('Selecione o módulo')}</title>
</svelte:head>

<AccessCard>
	<h1 class="mb-6 text-center text-2xl font-medium text-balance text-ink-strong">Selecione o módulo</h1>
	<div class="flex flex-col gap-3">
		{#each availableModules as module (module.role)}
			<Button href={resolve(module.path)} fullwidth bold class="min-h-12">
				<i class={[module.icon, 'fa-fw text-primary-ink']} aria-hidden="true"></i>{module.label}
			</Button>
		{/each}
		{#if data.canManageUsers}
			<Button href={resolve('usuarios')} fullwidth bold class="min-h-12">
				<i class="fa-solid fa-users-gear fa-fw text-primary-ink" aria-hidden="true"></i>Usuários
			</Button>
		{:else if availableModules.length === 0}
			<p role="status" class="text-center text-ink">
				Seu usuário ainda não tem acesso a nenhum módulo. Peça à coordenação do seu setor para liberar o acesso.
			</p>
		{/if}
	</div>
</AccessCard>
