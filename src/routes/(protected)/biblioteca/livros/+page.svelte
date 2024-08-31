<script lang="ts">
	import Pagination from '$lib/components/Pagination.svelte';
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ livros, total, role } = data);
</script>

<div class="mb-2">
	<nav id="breadcrumb" class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/biblioteca">Biblioteca</a></li>
			<li class="is-active">
				<a href="/biblioteca/livros" aria-current="page">Livros</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Consulta de livros</h1>
</div>

<form class="card" action="/biblioteca/livros" method="GET">
	<div class="card-content">
		<div class="field columns">
			<div class="column is-2">
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
				<button class="button is-primary is-fullwidth has-text-weight-semibold" type="submit">
					<i class="fa-solid fa-magnifying-glass fa-fw">&nbsp;</i>Pesquisar
				</button>
			</div>
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<a
					data-sveltekit-reload
					class="button is-fullwidth has-text-weight-semibold"
					href="/biblioteca/livros/novo"><i class="fa-solid fa-plus fa-fw">&nbsp;</i>Novo</a>
			</div>
		</div>
	</div>
</form>

{#if livros && livros.length > 0}
	<div class="card">
		<div class="card-content">
			<div class="table-container">
				<table class="table is-striped is-hoverable is-fullwidth">
					<thead>
						<th>Tombo</th>
						<th>Título</th>
						<th class="table-actions">Ações</th>
					</thead>
					<tbody>
						{#each livros as livro}
							<tr>
								<td>{livro.tombo}</td>
								<td>{livro.titulo}</td>
								<td class="table-actions">
									<div class="field is-grouped">
										<a
											data-sveltekit-reload
											class="control"
											href="/biblioteca/livros/{livro.idlivro}">
											<i class="fa-solid fa-pen-to-square fa-fw"></i>
										</a>
										<a
											data-sveltekit-reload
											class="control"
											href="/biblioteca/livros/{livro.idlivro}/exemplares">
											<i class="fa-solid fa-book fa-fw"></i>
										</a>
										<a
											data-sveltekit-reload
											class="control"
											href="/biblioteca/livros/{livro.idlivro}/autores">
											<i class="fa-solid fa-user-pen fa-fw"></i>
										</a>
										{#if role.includes('admin')}
											<form action="?/excluir&id={livro.idlivro}" method="POST">
												<button class="control"
													><i class="fa-regular fa-trash-can fa-fw"></i></button>
											</form>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<Pagination {total}></Pagination>
			</div>
		</div>
	</div>
{/if}
