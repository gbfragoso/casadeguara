<script lang="ts">
	import { resolve } from '$app/paths';
	import { createFormEnhancer } from '$lib/js/form-enhancer.svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { updateCadastroFlag, type CadastroFlagField } from './cadastro-flag';
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

	const getFlagKey = (field: CadastroFlagField, id: number) => `${field}-${id}`;
	const isFlagPending = (field: CadastroFlagField, id: number) => pendingFlags.has(getFlagKey(field, id));

	function setFlagPending(field: CadastroFlagField, id: number, pending: boolean) {
		const key = getFlagKey(field, id);
		if (pending) pendingFlags.add(key);
		else pendingFlags.delete(key);
	}

	function sendFlag(data: { id: number; field: CadastroFlagField; value: boolean }) {
		return fetch(resolve('/api/cadastros'), {
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

<div class="mb-2">
	<nav id="breadcrumb" class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href={resolve('/secretaria')}>Secretaria</a></li>
			<li class="is-active">
				<a href={resolve('/secretaria/cadastros')} aria-current="page">Cadastros</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Consulta de cadastros</h1>
</div>

<form class="card" method="POST" {@attach formEnhancer.submitWithLoading}>
	<div class="card-content">
		<div class="field">
			<label class="label" for="nome">Nome do trabalhador</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="nome"
					id="nome"
					bind:value={searchName}
					placeholder="Digite o nome do trabalhador"
					autocomplete="name"
					maxlength="60"
					aria-describedby={form?.errors?.nome?.length ? 'nome-errors' : undefined}
					aria-invalid={form?.errors?.nome?.length ? 'true' : undefined} />
			</div>
			{#if form?.errors?.nome?.length}
				<div id="nome-errors" class="help is-danger">
					{#each form.errors.nome as message (message)}
						<p>{message}</p>
					{/each}
				</div>
			{/if}
		</div>
		<div class="field">
			<input type="hidden" name="trabalhadores" value="false" />
			<label for="trabalhadores" class="checkbox">
				<input
					type="checkbox"
					name="trabalhadores"
					id="trabalhadores"
					value="true"
					bind:checked={workersOnly}
					aria-describedby={form?.errors?.trabalhadores?.length ? 'trabalhadores-errors' : undefined}
					aria-invalid={form?.errors?.trabalhadores?.length ? 'true' : undefined} />
				Somente trabalhadores
			</label>
		</div>
		<div class="columns">
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<button
					aria-busy={formEnhancer.loading}
					class={[
						'button is-primary is-fullwidth has-text-weight-semibold',
						{ 'is-loading': formEnhancer.loading },
					]}
					type="submit">
					<i class="fa-solid fa-magnifying-glass fa-fw">&nbsp;</i>Pesquisar
				</button>
			</div>
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<a
					class="button is-fullwidth has-text-weight-semibold is-warning"
					href={resolve('/secretaria/cadastros/novo')}><i class="fa-solid fa-plus fa-fw">&nbsp;</i>Novo</a>
			</div>
		</div>
		{#if form?.errors}
			<div class="notification is-danger" aria-live="polite">
				{#each Object.entries(form.errors) as [field, messages] (field)}
					<div id={`${field}-errors`}>
						{#each messages as message (`${field}-${message}`)}
							<p>{message}</p>
						{/each}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</form>

{#if flagError}
	<div class="notification is-danger mt-4" role="alert" aria-live="polite">{flagError}</div>
{/if}

{#if cadastros !== undefined}
	<div class="card mt-4">
		<div class="card-content">
			<span class="tag is-warning is-light is-size-5 mb-2"
				>Obs.: Somente os nomes marcados nas colunas &quot;trabalhador&quot; e &quot;frequência&quot; aparecerão
				na lista de presença.</span>
			{#if cadastros.length === 0}
				<p>Nenhum cadastro encontrado.</p>
			{:else}
				<div class="table-container">
					<table class="table is-striped is-hoverable is-fullwidth">
						<thead>
							<tr>
								<th style="width: 50px">Trabalhador</th>
								<th>Nome</th>
								<th title="Marque para aparecer na lista de frequência">Frequência</th>
								<th>Desencarnado</th>
								<th class="table-actions">Ações</th>
							</tr>
						</thead>
						<tbody>
							{#each cadastros as cadastro (cadastro.idleitor)}
								<tr>
									<td style="text-align: center; width: 50px">
										<input
											type="checkbox"
											checked={cadastro.trab}
											disabled={isFlagPending('trab', cadastro.idleitor)}
											aria-label={`Marcar ${cadastro.nome} como trabalhador`}
											onchange={(event) => handleFlagChange(event, 'trab', cadastro.idleitor)} />
									</td>
									<td>{cadastro.nome}</td>
									<td style="text-align: center; width: 50px">
										<input
											type="checkbox"
											checked={cadastro.frequencia}
											disabled={cadastro.desencarnado ||
												isFlagPending('frequencia', cadastro.idleitor)}
											aria-label={`Marcar ${cadastro.nome} na frequência`}
											onchange={(event) =>
												handleFlagChange(event, 'frequencia', cadastro.idleitor)} />
									</td>
									<td style="text-align: center; width: 50px">
										<input
											type="checkbox"
											checked={cadastro.desencarnado}
											disabled={isFlagPending('desencarnado', cadastro.idleitor)}
											aria-label={`Marcar ${cadastro.nome} como desencarnado`}
											onchange={(event) =>
												handleFlagChange(event, 'desencarnado', cadastro.idleitor)} />
									</td>
									<td class="table-actions">
										<a
											aria-label={`Editar cadastro de ${cadastro.nome}`}
											href={resolve('/(protected)/secretaria/cadastros/[id=integer]', {
												id: `${cadastro.idleitor}`,
											})}>
											<i class="fa-solid fa-pen-to-square fa-fw"></i>
										</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</div>
{/if}
