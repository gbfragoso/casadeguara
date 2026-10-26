<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import InlineNotification from '#lib/components/feedback/InlineNotification.svelte';
	import Tag from '#lib/components/feedback/Tag.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import type { ActionData, PageServerData } from './$types';

	type Props = { data: PageServerData; form: ActionData };

	let { data, form }: Props = $props();

	const importEnhancer = createFormEnhancer();
	const breadcrumb = [
		{ label: 'Comunicação', href: resolve('comunicacao') },
		{ label: 'Palestrantes', href: resolve('comunicacao/palestrantes') },
	];
</script>

<PageHeader {breadcrumb}>Importar do cadastro</PageHeader>

<Card element="form" action="/comunicacao/palestrantes/importar" method="GET">
	<Field id="nome" label="Nome no cadastro da Secretaria">
		{#snippet control()}
			<TextInput type="search" name="nome" id="nome" value={data.busca} placeholder="Digite o nome da pessoa" />
		{/snippet}
	</Field>
	<p class="mt-2 text-sm text-ink-muted">A importação copia somente o nome e a foto do cadastro.</p>
	<div class="mt-6">
		<Button type="submit" tone="primary" bold class="tablet:min-w-40">
			<i class="fa-solid fa-magnifying-glass fa-fw" aria-hidden="true"></i>Pesquisar
		</Button>
	</div>
</Card>

{#if form?.mensagem}
	<InlineNotification kind="danger" class="mt-6" role="alert" aria-live="assertive"
		>{form.mensagem}</InlineNotification>
{/if}

{#if data.busca.trim()}
	<Card element="section" class="mt-6" aria-label="Cadastros encontrados">
		{#if data.candidatos.length === 0}
			<p class="text-ink-muted">Nenhum cadastro encontrado.</p>
		{:else}
			<ul class="flex flex-col divide-y divide-divider" aria-label="Cadastros encontrados">
				{#each data.candidatos as candidato (candidato.cadastroId)}
					<li class="flex flex-wrap items-center gap-3 py-2">
						<span class="min-w-0 flex-1 font-medium wrap-anywhere">{candidato.nome}</span>
						<Tag kind={candidato.temFoto ? 'success' : undefined}
							>{candidato.temFoto ? 'Com foto' : 'Sem foto'}</Tag>
						{#if candidato.palestranteId === null}
							<form method="POST" action="?/importar" {@attach importEnhancer.submitWithLoading}>
								<input type="hidden" name="cadastroId" value={candidato.cadastroId} />
								<Button type="submit" tone="primary" aria-label={`Importar ${candidato.nome}`}
									>Importar</Button>
							</form>
						{:else}
							<Tag kind="info">Já importado</Tag>
							<Button
								tone="link"
								href={resolve('/(protected)/comunicacao/palestrantes/[id=integer]', {
									id: `${candidato.palestranteId}`,
								})}>Ver palestrante</Button>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</Card>
{/if}
