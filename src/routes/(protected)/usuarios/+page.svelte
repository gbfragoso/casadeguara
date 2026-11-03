<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import Section from '#lib/components/layout/Section.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import type { PageServerData } from './$types';
	interface Props {
		data: PageServerData;
	}

	let { data }: Props = $props();
	let { usuarios } = $derived(data);
	const breadcrumb = [
		{ label: 'Módulos', href: resolve('sistemas') },
		{ label: 'Usuários', href: resolve('usuarios') },
	];
</script>

<main>
	<Section class="mx-auto max-w-2xl">
		<PageHeader {breadcrumb}>Usuários</PageHeader>

		<div class="mb-6">
			<Button href={resolve('usuarios/novo')} tone="primary" bold>
				<i class="fa-solid fa-plus fa-fw" aria-hidden="true"></i>Novo usuário
			</Button>
		</div>

		<Card padded={false}>
			{#if usuarios.length === 0}
				<p class="p-5 text-ink-muted tablet:p-6">Nenhum usuário encontrado.</p>
			{:else}
				<ul class="divide-y divide-divider">
					{#each usuarios as usuario (usuario.id)}
						<li class="flex flex-col gap-1 px-5 py-4 tablet:px-6">
							<a
								href={resolve('/(protected)/usuarios/[id=alphanumeric]', { id: usuario.id })}
								class="font-medium wrap-anywhere text-primary-ink underline-offset-4 hover:underline">
								{usuario.name}
							</a>
							<p class="text-sm wrap-anywhere text-ink-muted">{usuario.username}</p>
							<p class="text-sm wrap-anywhere text-ink-muted">{usuario.accessSummary}</p>
						</li>
					{/each}
				</ul>
			{/if}
		</Card>
	</Section>
</main>
