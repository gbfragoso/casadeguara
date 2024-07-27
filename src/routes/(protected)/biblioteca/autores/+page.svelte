<script lang="ts">
	import Pagination from "$lib/components/Pagination.svelte";
	import type { PageServerData } from "./$types";
	export let data: PageServerData;

	$: ({ autores, total } = data);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/biblioteca">Biblioteca</a></li>
			<li class="is-active">
				<a href="/biblioteca/autores" aria-current="page">Autores</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold is-primary">
		Consulta de autores
	</h1>
</div>

<form class="card" action="/biblioteca/autores" method="GET">
	<div class="card-content">
		<div class="field">
			<label class="label" for="nome">Nome do autor</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="nome"
					id="nome"
					placeholder="Digite o nome do autor"
				/>
			</div>
		</div>
		<div class="field is-grouped">
			<div class="control">
				<button class="button is-primary px-5" type="submit">
					<i class="fa-solid fa-magnifying-glass">&nbsp;</i>Pesquisar
				</button>
			</div>
			<div class="control">
				<a class="button px-6" href="/biblioteca/autores/novo"
					><i class="fa-solid fa-plus">&nbsp;</i>Novo</a
				>
			</div>
		</div>
	</div>
</form>

	<div class="card">
		<div class="card-content table-container">
			<table class="table is-striped is-hoverable is-fullwidth">
				<thead>
					<th>Nome</th>
					<th>Ações</th>
				</thead>
				<tbody>
				{#await autores}
					<tr>Carregando autores...</tr>
				{:then}
					{#each autores as autor}
						<tr>
							<td>{autor.nome}</td>
							<td>
								<a href="/biblioteca/autores/{autor.idautor}">
									<i class="fa-solid fa-pen-to-square"></i>
								</a>
							</td>
						</tr>
					{/each}
				{:catch error}
					<tr>Erro ao carregar os resultados: {error.message}</tr>
				{/await}
				</tbody>
			</table>
			<Pagination {total}></Pagination>
		</div>
	</div>
