<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { PageServerData } from './$types';

	export let data: PageServerData;
	$: ({ contribuintes, total } = data);
	$: currentPage = 1;
	$: totalPages = Math.ceil(total / 10);

	function paginate(newPage: number) {
		console.log(total);
		let query = new URLSearchParams($page.url.searchParams.toString());
		if (newPage < 1) {
			newPage = 1;
		}
		if (newPage > totalPages) {
			newPage = totalPages;
		}
		currentPage = newPage;
		query.set('page', String(newPage));
		goto(`?${query.toString()}`);
	}
</script>

<hgroup>
	<h2 class="pico-color-azure-500">Contribuintes</h2>
	<p>Consulta de contribuintes</p>
</hgroup>

<div class="card">
	<form action="/financeiro/contribuintes" method="GET">
		<label style="width: 100%">
			Nome do contribuinte
			<input type="search" name="nome" id="nome" placeholder="Digite o nome do contribuinte" />
		</label>
		<div class="flex-container" style="width: 25%">
			<button class="outline" type="submit">
				<i class="fa-solid fa-magnifying-glass">&nbsp;</i>Pesquisar
			</button>
			<a href="/financeiro/contribuintes/novo" style="width: 100%">
				<button class="primary"><i class="fa-solid fa-plus">&nbsp;</i>Novo</button>
			</a>
		</div>
	</form>
</div>

<div class="card overflow-auto">
	<table class="striped">
		<thead>
			<th scope="col">Contribuinte</th>
			<th scope="col">Tipo</th>
			<th scope="col">Ações</th>
		</thead>
		<tbody>
			{#await contribuintes}
				<tr>Carregando lista de contribuintes</tr>
			{:then}
				{#each contribuintes as contribuinte}
					<tr>
						<td>{contribuinte.nome}</td>
						{#if contribuinte.trabalhador}
							<td>Trabalhador</td>
						{:else}
							<td>Eventual</td>
						{/if}
						<td>
							<form method="POST">
								<a href="/financeiro/contribuintes/{contribuinte.idcontribuinte}">
									<i class="fa-solid fa-pen-to-square"></i>
								</a>
							</form>
						</td>
					</tr>
				{/each}
			{:catch error}
				<tr>Falha ao carregar a lista de contribuintes</tr>
			{/await}
		</tbody>
	</table>
	<div class="pagination">
		<button class="outline" on:click|preventDefault={() => paginate(1)}
			><i class="fa-solid fa-angles-left"></i></button
		>
		<button class="outline" on:click|preventDefault={() => paginate(currentPage - 1)}
			><i class="fa-solid fa-angle-left"></i></button
		>
		<p>Página {currentPage} / {totalPages}</p>
		<button class="outline" on:click|preventDefault={() => paginate(currentPage + 1)}
			><i class="fa-solid fa-angle-right"></i></button
		>
		<button class="outline" on:click|preventDefault={() => paginate(totalPages)}
			><i class="fa-solid fa-angles-right"></i></button
		>
	</div>
</div>
