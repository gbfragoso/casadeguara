<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import type { ActionData, PageServerData } from './$types';
	interface Props {
		form: ActionData;
		data: PageServerData;
	}

	let { data, form }: Props = $props();
	let loading = $state(false);
	let { colecoes } = $derived(data);
</script>

<div class="mb-2">
	<nav id="breadcrumb" class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href={resolve('/acervo')}>Acervo</a></li>
			<li class="is-active">
				<a href={resolve('/acervo')} aria-current="page">Livros</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Consulta de livros</h1>
</div>

<form
	class="card"
	method="POST"
	use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			await update();
			loading = false;
		};
	}}>
	<div class="card-content">
		<div class="field columns">
			<div class="column">
				<label class="label" for="titulo">Título</label>
				<div class="control">
					<input class="input" type="text" name="titulo" id="titulo" placeholder="Digite o título do livro" />
				</div>
			</div>
			<div class="column">
				<label class="label" for="autor">Autor</label>
				<div class="control">
					<input class="input" type="text" name="autor" id="autor" placeholder="Digite o nome do autor" />
				</div>
			</div>
		</div>
		<div class="field columns">
			<div class="column">
				<label class="label" for="editora">Editora</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="editora"
						id="editora"
						placeholder="Digite o nome da editora" />
				</div>
			</div>
			<div class="column">
				<label class="label" for="serie">Coleção</label>
				<div class="select is-fullwidth">
					<select name="serie" id="serie">
						<option></option>
						{#await colecoes then item}
							{#each item as serie (serie.idserie)}
								<option value={serie.idserie}>{serie.nome}</option>
							{/each}
						{/await}
					</select>
				</div>
			</div>
			<div class="column">
				<label class="label" for="autor">Palavra-chave</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="keyword"
						id="keyword"
						placeholder="Digite uma palavra-chave" />
				</div>
			</div>
		</div>
		<div class="columns">
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<button
					aria-busy={loading}
					class:is-loading={loading}
					class="button is-primary is-fullwidth has-text-weight-semibold"
					type="submit">
					<i class="fa-solid fa-magnifying-glass fa-fw">&nbsp;</i>Pesquisar
				</button>
			</div>
		</div>
	</div>
</form>

{#if form?.livros}
	<div class="card">
		<div class="card-content">
			<div class="table-container">
				<table class="table is-striped is-hoverable is-fullwidth">
					<thead>
						<tr>
							<th>Título</th>
							<th>Disponíveis</th>
						</tr>
					</thead>
					<tbody>
						{#each form.livros as livro (livro.idlivro)}
							<tr>
								<td
									>{livro.titulo}<br />
									{#each livro.autores as autor (autor)}
										<span class="tag is-light is-success">{autor}</span>&nbsp;&nbsp;
									{/each}</td>
								<td>{livro.disponiveis}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
{/if}
