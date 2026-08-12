<script lang="ts">
	import { enhance } from '$app/forms';
	import { fromAction } from 'svelte/attachments';
	import type { ActionData, SubmitFunction } from './$types';

	interface Props {
		form: ActionData | null | undefined;
	}

	let { form }: Props = $props();
	let loading = $state(false);
	let errors = $derived(form?.errors?.nome ?? []);

	function submit(): SubmitFunction {
		return () => {
			loading = true;
			return async ({ update }) => {
				try {
					await update();
				} finally {
					loading = false;
				}
			};
		};
	}

	function enhanceForm(form: HTMLFormElement, callback: SubmitFunction) {
		return enhance(form, callback);
	}
</script>

<div class="mb-2">
	<nav id="breadcrumb" class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/biblioteca">Biblioteca</a></li>
			<li class="is-active"><a href="/biblioteca/autores" aria-current="page">Autores</a></li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Consulta de autores</h1>
</div>

<form class="card" method="POST" {@attach fromAction(enhanceForm, submit)}>
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
					aria-invalid={errors.length > 0}
					aria-describedby={errors.length > 0 ? 'nome-errors' : undefined} />
			</div>
			{#if errors.length > 0}
				<div id="nome-errors" class="help is-danger">
					{#each errors as message (message)}<p>{message}</p>{/each}
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
				<a class="button is-fullwidth has-text-weight-semibold is-warning" href="/biblioteca/autores/novo"
					><i class="fa-solid fa-plus fa-fw">&nbsp;</i>Novo</a>
			</div>
		</div>
	</div>
</form>

{#if form?.autores}
	<div class="card">
		<div class="card-content">
			{#if form.autores.length > 0}
				<div class="table-container">
					<table class="table is-striped is-hoverable is-fullwidth">
						<thead><tr><th>Nome</th><th class="table-actions">Ações</th></tr></thead>
						<tbody>
							{#each form.autores as autor (autor.idautor)}
								<tr
									><td>{autor.nome}</td><td class="table-actions"
										><a
											aria-label={`Editar autor ${autor.nome}`}
											href={`/biblioteca/autores/${autor.idautor}`}
											><i class="fa-solid fa-pen-to-square fa-fw"></i></a
										></td
									></tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<p>Nenhum autor encontrado.</p>
			{/if}
		</div>
	</div>
{/if}
