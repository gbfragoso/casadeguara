<script lang="ts">
	import Pagination from "$lib/components/Pagination.svelte";
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ keywords, total } = data);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
		  <li><a href="/biblioteca">Biblioteca</a></li>
		  <li class="is-active"><a href="/biblioteca/keywords" aria-current="page">Palavras-chave</a></li>
		</ul>
	  </nav>
	<h1 class="is-size-3 has-text-weight-semibold">Consulta de palavras-chave</h1>
</div>

<form class="card" action="/biblioteca/keywords" method="GET">
	<div class="card-content">
		<div class="field">
			<label class="label" for="nome">Palavra-chave</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="nome"
					id="nome"
					placeholder="Digite a palavra-chave"
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
				<a class="button px-6" href="/biblioteca/keywords/novo"
					><i class="fa-solid fa-plus">&nbsp;</i>Novo</a
				>
			</p>
		</div>
	</div>
</form>

<div class="card">
	<div class="card-content">
		<table class="table is-striped is-hoverable is-fullwidth">
			<thead>
				<th>Nome</th>
				<th>Ações</th>
			</thead>
			<tbody>
				{#await keywords}
					<tr>Carregando coleções...</tr>
				{:then}
					{#each keywords as keyword}
						<tr>
							<td>{keyword.chave}</td>
							<td>
								<a href="/biblioteca/keywords/{keyword.idkeyword}">
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
