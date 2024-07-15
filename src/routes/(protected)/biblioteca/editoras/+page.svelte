<script lang="ts">
	import Pagination from "$lib/components/Pagination.svelte";
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ editoras, total } = data);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
		  <li><a href="/biblioteca">Biblioteca</a></li>
		  <li class="is-active"><a href="/biblioteca/editoras" aria-current="page">Editoras</a></li>
		</ul>
	  </nav>
	<h1 class="is-size-3 has-text-weight-semibold">Consulta de editoras</h1>
</div>

<form class="card" action="/biblioteca/editoras" method="GET">
	<div class="card-content">
		<div class="field">
			<label class="label" for="nome">Nome da editora</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="nome"
					id="nome"
					placeholder="Digite o nome da editora"
				/>
			</div>
		</div>
		<div class="field is-grouped">
			<p class="control">
				<button class="button is-primary px-5" type="submit">
					<i class="fa-solid fa-magnifying-glass">&nbsp;</i>Pesquisar
				</button>
			</p>
			<p class="control">
				<a class="button px-6" href="/biblioteca/editoras/novo"
					><i class="fa-solid fa-plus">&nbsp;</i>Novo</a
				>
			</p>
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
				{#await editoras}
					<tr>Carregando coleções...</tr>
				{:then}
					{#each editoras as editora}
						<tr>
							<td>{editora.nome}</td>
							<td>
								<a href="/biblioteca/editoras/{editora.ideditora}">
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
		<Pagination total={total}></Pagination>
	</div>
</div>