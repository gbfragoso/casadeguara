<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
	let loading = $state(false);
</script>

<div class="mb-2">
	<nav id="breadcrumb" class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/acervo">Acervo</a></li>
			<li class="is-active">
				<a href="/acervo/livros" aria-current="page">Livros</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Consulta de livros</h1>
</div>

<form
	class="card"
	action="?/pesquisar"
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
				<label class="label" for="tombo">Tombo</label>
				<div class="control">
					<input class="input" type="number" name="tombo" id="tombo" placeholder="Digite o tombo do livro" />
				</div>
			</div>
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
				<div class="control">
					<input class="input" type="text" name="serie" id="serie" placeholder="Digite o nome da coleção" />
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
						placeholder="Digite uma palavr-chave" />
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
							<th>Tombo</th>
							<th>Título</th>
							<th>Palavra-chave</th>
							<th>Referência</th>
							<th class="table-actions">Ações</th>
						</tr>
					</thead>
					<tbody>
						{#each form.livros as livro}
							<tr>
								<td>{livro.tombo}</td>
								<td>{livro.titulo}</td>
								<td>{livro.keyword}</td>
								<td>{livro.referencia}</td>
								<td class="table-actions">
									<div class="field is-grouped">
										<a aria-label="autores" title="Autores" class="control" href="/acervo/{livro.idlivro}/autores">
											<i class="fa-solid fa-user-pen fa-fw"></i>
										</a>
										<a
											aria-label="exemplares"
											title="Exemplares"
											class="control"
											href="/acervo/{livro.idlivro}/exemplares">
											<i class="fa-solid fa-book fa-fw"></i>
										</a>
										<a
											aria-label="keywords"
											title="Palavas-chave"
											class="control"
											href="/acervo/{livro.idlivro}/keywords">
											<i class="fa-solid fa-key fa-fw"></i>
										</a>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
{/if}
