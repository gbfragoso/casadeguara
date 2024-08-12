<script lang="ts">
	import Pagination from "$lib/components/Pagination.svelte";
	import type { PageServerData } from "./$types";
	export let data: PageServerData;

	$: ({ livros, total } = data);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/biblioteca">Biblioteca</a></li>
			<li class="is-active">
				<a href="/biblioteca/livros" aria-current="page">Livros</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold">Consulta de livros</h1>
</div>

<form class="card" action="/biblioteca/livros" method="GET">
	<div class="card-content">
		<div class="field columns">
			<div class="column is-2">
				<label class="label" for="tombo">Tombo</label>
				<div class="control">
					<input
						class="input"
						type="number"
						name="tombo"
						id="tombo"
						placeholder="Digite o tombo do livro"
					/>
				</div>
			</div>
			<div class="column">
				<label class="label" for="titulo">Título</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="titulo"
						id="titulo"
						placeholder="Digite o título do livro"
					/>
				</div>
			</div>
		</div>
		<div class="field columns">
			<div class="column">
				<label class="label" for="autor">Autor</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="autor"
						id="autor"
						placeholder="Digite o nome do autor"
					/>
				</div>
			</div>
			<div class="column">
				<label class="label" for="editora">Editora</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="editora"
						id="editora"
						placeholder="Digite o nome da editora"
					/>
				</div>
			</div>
			<div class="column">
				<label class="label" for="serie">Coleção</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="serie"
						id="serie"
						placeholder="Digite o nome da coleção"
					/>
				</div>
			</div>
		</div>
		<div class="field is-grouped">
			<div class="control">
				<button class="button is-primary px-5" type="submit">
					<i class="fa-solid fa-magnifying-glass">&nbsp;</i>Pesquisar
				</button>
			</div>
			<div class="control">
				<a class="button px-6" href="/biblioteca/livros/novo"
					><i class="fa-solid fa-plus">&nbsp;</i>Novo</a
				>
			</div>
		</div>
	</div>
</form>

{#if livros && livros.length > 0}
	<div class="card">
		<div class="card-content table-container">
			<table class="table is-striped is-hoverable is-fullwidth">
				<thead>
					<th>Tombo</th>
					<th>Título</th>
					<th>Ações</th>
				</thead>
				<tbody>
					{#each livros as livro}
						<tr>
							<td>{livro.tombo}</td>
							<td>{livro.titulo}</td>
							<td>
								<div class="field is-grouped">
									<a
										data-sveltekit-reload
										class="control"
										href="/biblioteca/livros/{livro.idlivro}"
									>
										<i class="fa-solid fa-pen-to-square"
										></i>
									</a>
									<a
										data-sveltekit-reload
										class="control"
										href="/biblioteca/livros/{livro.idlivro}/exemplares"
									>
										<i class="fa-solid fa-book"
										></i>
									</a>
									<form
										action="?/excluir&id={livro.idlivro}"
										method="POST"
									>
										<button class="control"
											><i class="fa-regular fa-trash-can"
											></i></button
										>
									</form>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
			<Pagination {total}></Pagination>
		</div>
	</div>
{/if}
