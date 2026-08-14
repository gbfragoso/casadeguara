<script lang="ts">
	import { resolve } from '$app/paths';
	import { createFormEnhancer } from '$lib/js/form-enhancer.svelte';
	import type { ActionData } from './$types';

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
	const formEnhancer = createFormEnhancer();
</script>

<div class="mb-2">
	<nav id="breadcrumb" class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href={resolve('/biblioteca')}>Biblioteca</a></li>
			<li class="is-active">
				<a href={resolve('/biblioteca/autores')} aria-current="page">Autores</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Consulta de autores</h1>
</div>

<form class="card" method="POST" {@attach formEnhancer.attachment}>
	<div class="card-content">
		<div class="field">
			<label class="label" for="nome">Nome do autor</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="nome"
					id="nome"
					value={form?.values?.nome ?? ''}
					placeholder="Digite o nome do autor"
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
					href={resolve('/biblioteca/autores/novo')}><i class="fa-solid fa-plus fa-fw">&nbsp;</i>Novo</a>
			</div>
		</div>
	</div>
</form>

{#if form?.autores !== undefined}
	<div class="card">
		<div class="card-content">
			{#if form.autores.length === 0}
				<p>Nenhum autor encontrado.</p>
			{:else}
				<div class="table-container">
					<table class="table is-striped is-hoverable is-fullwidth">
						<thead>
							<tr>
								<th>Nome</th>
								<th class="table-actions">Ações</th>
							</tr>
						</thead>
						<tbody>
							{#each form.autores as autor (autor.idautor)}
								<tr>
									<td>{autor.nome}</td>
									<td class="table-actions">
										<a
											aria-label={`Editar autor ${autor.nome}`}
											href={resolve('/(protected)/biblioteca/autores/[id=integer]', {
												id: `${autor.idautor}`,
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
