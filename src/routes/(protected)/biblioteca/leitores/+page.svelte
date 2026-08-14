<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { fromAction } from 'svelte/attachments';
	import type { ActionData } from './$types';

	type SubmitCallback = Exclude<Awaited<ReturnType<SubmitFunction>>, void>;

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
	let loading = $state(false);
	let leitores = $derived(form?.leitores);
	let searchName = $derived(form?.values?.nome ?? '');

	function handleSubmit(): SubmitCallback {
		loading = true;

		return async ({ update }) => {
			try {
				await update();
			} finally {
				loading = false;
			}
		};
	}
</script>

<div class="mb-2">
	<nav id="breadcrumb" class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href={resolve('/biblioteca')}>Biblioteca</a></li>
			<li class="is-active">
				<a href={resolve('/biblioteca/leitores')} aria-current="page">Leitores</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Consulta de leitores</h1>
</div>

<form class="card" method="POST" {@attach fromAction(enhance, () => handleSubmit)}>
	<div class="card-content">
		<div class="field">
			<label class="label" for="nome">Nome do leitor</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="nome"
					id="nome"
					bind:value={searchName}
					placeholder="Digite o nome do leitor"
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
		<div class="columns">
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<button
					aria-busy={loading}
					class={['button is-primary is-fullwidth has-text-weight-semibold', { 'is-loading': loading }]}
					type="submit">
					<i class="fa-solid fa-magnifying-glass fa-fw">&nbsp;</i>Pesquisar
				</button>
			</div>
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<a
					class="button is-fullwidth has-text-weight-semibold is-warning"
					href={resolve('/biblioteca/leitores/novo')}><i class="fa-solid fa-plus fa-fw">&nbsp;</i>Novo</a>
			</div>
		</div>
	</div>
</form>

{#if leitores !== undefined}
	<div class="card">
		<div class="card-content">
			{#if leitores.length === 0}
				<p>Nenhum leitor encontrado.</p>
			{:else}
				<div class="table-container">
					<table class="table is-striped is-hoverable is-fullwidth">
						<thead>
							<tr>
								<th>Nome</th>
								<th>Trabalhador</th>
								<th>Status</th>
								<th class="table-actions">Ações</th>
							</tr>
						</thead>
						<tbody>
							{#each leitores as leitor (leitor.idleitor)}
								<tr>
									<td>{leitor.nome}</td>
									<td>{leitor.trab ? 'Sim' : 'Não'}</td>
									<td>{leitor.status ? 'Ativo' : 'Inativo'}</td>
									<td class="table-actions">
										<a
											aria-label={`Editar leitor ${leitor.nome}`}
											href={resolve('/(protected)/biblioteca/leitores/[id=integer]', {
												id: `${leitor.idleitor}`,
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
