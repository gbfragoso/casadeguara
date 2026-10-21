<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/actions/Button.svelte';
	import ButtonGroup from '#lib/components/actions/ButtonGroup.svelte';
	import IconAction from '#lib/components/actions/IconAction.svelte';
	import DataTable from '#lib/components/data/DataTable.svelte';
	import InlineNotification from '#lib/components/feedback/InlineNotification.svelte';
	import Checkbox from '#lib/components/forms/Checkbox.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import TextInput from '#lib/components/forms/TextInput.svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import PageHeader from '#lib/components/navigation/PageHeader.svelte';
	import { createFormEnhancer } from '#lib/forms/enhancer.svelte.js';
	import { SvelteSet } from 'svelte/reactivity';
	import { updateCadastroFlag, type CadastroFlagField } from '#lib/cadastros/flags.js';
	import type { ActionData } from './$types';

	type CheckboxEvent = Event & { currentTarget: HTMLInputElement };

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let pendingFlags = new SvelteSet<string>();
	let flagError = $state('');
	let cadastros = $derived(form?.cadastros);
	let searchName = $derived(form?.values?.nome ?? '');
	let workersOnly = $derived(form?.values?.trabalhadores === 'true');
	const breadcrumb = [
		{ label: 'Secretaria', href: resolve('secretaria') },
		{ label: 'Cadastros', href: resolve('secretaria/cadastros') },
	];

	const getFlagKey = (field: CadastroFlagField, id: number) => `${field}-${id}`;
	const isFlagPending = (field: CadastroFlagField, id: number) => pendingFlags.has(getFlagKey(field, id));

	function setFlagPending(field: CadastroFlagField, id: number, pending: boolean) {
		const key = getFlagKey(field, id);
		if (pending) pendingFlags.add(key);
		else pendingFlags.delete(key);
	}

	function sendFlag(data: { id: number; field: CadastroFlagField; value: boolean }) {
		return fetch(resolve('api/cadastros'), {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(data),
		});
	}

	function handleFlagChange(event: CheckboxEvent, field: CadastroFlagField, id: number) {
		return updateCadastroFlag(event.currentTarget, { field, id }, sendFlag, {
			setPending: setFlagPending,
			setError: (message) => (flagError = message),
		});
	}
</script>

<PageHeader {breadcrumb} icon="fa-brands fa-wpforms">Consulta de cadastros</PageHeader>

<Card element="form" method="POST" class="flex flex-col gap-4" {@attach formEnhancer.submitWithLoading}>
	<Field id="nome" label="Nome do trabalhador" errors={form?.errors?.nome}>
		{#snippet control({ describedBy, invalid })}
			<TextInput
				type="text"
				name="nome"
				id="nome"
				bind:value={searchName}
				placeholder="Digite o nome do trabalhador"
				autocomplete="name"
				maxlength={60}
				aria-describedby={describedBy}
				aria-invalid={invalid} />
		{/snippet}
	</Field>
	<div>
		<input type="hidden" name="trabalhadores" value="false" />
		<Checkbox
			name="trabalhadores"
			id="trabalhadores"
			value="true"
			bind:checked={workersOnly}
			aria-describedby={form?.errors?.trabalhadores?.length ? 'trabalhadores-errors' : undefined}
			aria-invalid={form?.errors?.trabalhadores?.length ? 'true' : undefined}>Somente trabalhadores</Checkbox>
	</div>
	<ButtonGroup class="mt-2">
		<Button type="submit" tone="primary" loading={formEnhancer.loading} class="font-bold tablet:min-w-50">
			<i class="fa-solid fa-magnifying-glass fa-fw" aria-hidden="true"></i>Pesquisar
		</Button>
		<Button href={resolve('secretaria/cadastros/novo')} tone="warning" class="font-bold tablet:min-w-50">
			<i class="fa-solid fa-plus fa-fw" aria-hidden="true"></i>Novo
		</Button>
	</ButtonGroup>
	{#if form?.errors}
		<InlineNotification kind="danger" aria-live="polite">
			<div>
				{#each Object.entries(form.errors) as [field, messages] (field)}
					<div id={field === 'nome' ? undefined : `${field}-errors`}>
						{#each messages as message (`${field}-${message}`)}
							<p>{message}</p>
						{/each}
					</div>
				{/each}
			</div>
		</InlineNotification>
	{/if}
</Card>

{#if flagError}
	<InlineNotification kind="danger" role="alert" aria-live="polite" class="mt-6"
		><p>{flagError}</p></InlineNotification>
{/if}

{#if cadastros !== undefined}
	<Card class="mt-6 flex flex-col gap-4">
		<InlineNotification kind="warning" element="p"
			>Obs.: Somente os nomes marcados nas colunas &quot;trabalhador&quot; e &quot;frequência&quot; aparecerão na
			lista de presença.</InlineNotification>
		{#if cadastros.length === 0}
			<p>Nenhum cadastro encontrado.</p>
		{:else}
			<DataTable class="-mx-5 tablet:-mx-6">
				{#snippet head()}
					<tr>
						<th class="w-12">Trabalhador</th>
						<th>Nome</th>
						<th title="Marque para aparecer na lista de frequência">Frequência</th>
						<th>Desencarnado</th>
						<th>Amigo Fraterno</th>
						<th class="print:hidden">Ações</th>
					</tr>
				{/snippet}
				{#each cadastros as cadastro (cadastro.idleitor)}
					<tr>
						<td class="w-12 text-center">
							<input
								type="checkbox"
								class="size-5 rounded-sm"
								checked={cadastro.trab}
								disabled={isFlagPending('trab', cadastro.idleitor)}
								aria-label={`Marcar ${cadastro.nome} como trabalhador`}
								onchange={(event) => handleFlagChange(event, 'trab', cadastro.idleitor)} />
						</td>
						<td>{cadastro.nome}</td>
						<td class="w-12 text-center">
							<input
								type="checkbox"
								class="size-5 rounded-sm"
								checked={cadastro.frequencia}
								disabled={cadastro.desencarnado || isFlagPending('frequencia', cadastro.idleitor)}
								aria-label={`Marcar ${cadastro.nome} na frequência`}
								onchange={(event) => handleFlagChange(event, 'frequencia', cadastro.idleitor)} />
						</td>
						<td class="w-12 text-center">
							<input
								type="checkbox"
								class="size-5 rounded-sm"
								checked={cadastro.desencarnado}
								disabled={isFlagPending('desencarnado', cadastro.idleitor)}
								aria-label={`Marcar ${cadastro.nome} como desencarnado`}
								onchange={(event) => handleFlagChange(event, 'desencarnado', cadastro.idleitor)} />
						</td>
						<td class="w-12 text-center">
							<input
								type="checkbox"
								class="size-5 rounded-sm"
								checked={cadastro.amigoFraterno}
								disabled={isFlagPending('amigoFraterno', cadastro.idleitor)}
								aria-label={`Marcar ${cadastro.nome} para o Amigo Fraterno`}
								onchange={(event) => handleFlagChange(event, 'amigoFraterno', cadastro.idleitor)} />
						</td>
						<td class="print:hidden">
							<IconAction
								icon="fa-regular fa-pen-to-square"
								aria-label={`Editar cadastro de ${cadastro.nome}`}
								href={resolve('/(protected)/secretaria/cadastros/[id=integer]', {
									id: `${cadastro.idleitor}`,
								})} />
						</td>
					</tr>
				{/each}
			</DataTable>
		{/if}
	</Card>
{/if}
