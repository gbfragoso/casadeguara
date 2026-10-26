<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import ButtonGroup from '#lib/components/actions/ButtonGroup.svelte';
	import Tag from '#lib/components/feedback/Tag.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import SpeakerAvatar from '#lib/components/talks/SpeakerAvatar.svelte';
	import type { PageServerData } from './$types';

	type Props = { data: PageServerData };

	let { data }: Props = $props();

	const breadcrumb = [
		{ label: 'Comunicação', href: resolve('comunicacao') },
		{ label: 'Palestrantes', href: resolve('comunicacao/palestrantes') },
	];
</script>

<PageHeader {breadcrumb}>Palestrantes</PageHeader>

<Card element="form" action="/comunicacao/palestrantes" method="GET">
	<Field id="nome" label="Nome do palestrante">
		{#snippet control()}
			<TextInput
				type="search"
				name="nome"
				id="nome"
				value={data.busca}
				placeholder="Digite o nome do palestrante" />
		{/snippet}
	</Field>
	<ButtonGroup class="mt-6">
		<Button type="submit" tone="primary" bold class="tablet:min-w-40">
			<i class="fa-solid fa-magnifying-glass fa-fw" aria-hidden="true"></i>Pesquisar
		</Button>
		<Button href={resolve('comunicacao/palestrantes/novo')} tone="default" bold>
			<i class="fa-solid fa-plus fa-fw" aria-hidden="true"></i>Novo palestrante
		</Button>
		<Button href={resolve('comunicacao/palestrantes/importar')} tone="default" bold>
			<i class="fa-solid fa-file-import fa-fw" aria-hidden="true"></i>Importar do cadastro
		</Button>
	</ButtonGroup>
</Card>

<Card element="section" class="mt-6" aria-label="Palestrantes cadastrados">
	{#if data.palestrantes.length === 0}
		<p class="text-ink-muted">Nenhum palestrante encontrado.</p>
	{:else}
		<ul class="flex flex-col divide-y divide-divider" aria-label="Palestrantes">
			{#each data.palestrantes as palestrante (palestrante.id)}
				<li class="flex flex-wrap items-center gap-3 py-2">
					<a
						class="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-md font-medium wrap-anywhere text-primary-ink hover:underline"
						href={resolve('/(protected)/comunicacao/palestrantes/[id=integer]', {
							id: `${palestrante.id}`,
						})}>
						<SpeakerAvatar
							id={palestrante.id}
							nome={palestrante.nome}
							temFoto={palestrante.temFoto}
							alt="" />
						{palestrante.nome}
					</a>
					{#if palestrante.importado}
						<Tag kind="info">Importado do cadastro</Tag>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</Card>
