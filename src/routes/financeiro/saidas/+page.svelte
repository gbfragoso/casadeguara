<script lang="ts">
	import { formatarData } from '$lib/js/date';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { PageServerData } from './$types';

	export let data: PageServerData;
	$: ({ saidas, total } = data);
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
	<h2 class="pico-color-azure-500">Saídas</h2>
	<p>Listagem de despesas da instituição</p>
</hgroup>

<div class="card">
	<form action="/financeiro/saidas" method="GET">
		<div class="flex-container">
			<label style="width: 100%">
				Descrição
				<input type="text" name="descricao" id="descricao" placeholder="Digite a descrição" />
			</label>
			<label>
				Data Inicial
				<input type="date" name="dataInicio" aria-label="Date" />
			</label>
			<label>
				Data final
				<input type="date" name="dataFim" aria-label="Date" />
			</label>
		</div>
		<div class="flex-container" style="width: 25%">
			<button class="outline" type="submit">
				<i class="fa-solid fa-magnifying-glass">&nbsp;</i>Pesquisar
			</button>
			<a href="/financeiro/saidas/novo" style="width: 100%">
				<button class="primary"><i class="fa-solid fa-plus">&nbsp;</i>Novo</button>
			</a>
		</div>
	</form>
</div>

<div class="card overflow-auto">
	<table class="striped">
		<thead>
			<th scope="col">Valor</th>
			<th scope="col">Descrição</th>
			<th scope="col">Data</th>
			<th scope="col">Ações</th>
		</thead>
		<tbody>
			{#await saidas}
				<tr>Carregando resultados</tr>
			{:then}
				{#each saidas as saida}
					<tr>
						<td>R$ {saida.valor}</td>
						<td>{saida.descricao}</td>
						<td>{formatarData(saida.data_saida)}</td>
						<td>
							<a href="/financeiro/saidas/{saida.idsaida}">
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
