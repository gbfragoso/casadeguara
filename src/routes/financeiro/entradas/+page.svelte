<script lang="ts">
	import dayjs from 'dayjs';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { PageServerData } from './$types';

	export let data: PageServerData;

	$: ({ entradas, total } = data);
	$: currentPage = 1;
	$: totalPages = Math.ceil(total / 10);

	function paginate(newPage: number) {
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
	<h2 class="pico-color-azure-500">Entradas</h2>
	<p>Lista de doações e/ou valores recebidos</p>
</hgroup>

<div class="card">
	<form action="/financeiro/entradas" method="GET">
		<div class="flex-container">
			<label style="width: 100%">
				Contribuinte
				<input
					type="text"
					name="contribuinte"
					id="contribuinte"
					placeholder="Digite o nome do contribuinte"
				/>
			</label>
			<label>
				Data inicial
				<input type="date" name="dataInicio" id="dataInicio" aria-label="Date" />
			</label>
			<label
				>Data Final
				<input type="date" name="dataFim" id="dataFim" aria-label="Date" />
			</label>
		</div>
		<div class="flex-container" style="width: 25%">
			<button class="outline" type="submit">
				<i class="fa-solid fa-magnifying-glass">&nbsp;</i>Pesquisar
			</button>
			<a href="/financeiro/entradas/novo" style="width: 100%">
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
			<th scope="col">Valor</th>
			<th scope="col">Descrição</th>
			<th scope="col">Data</th>
			<th scope="col">Ações</th>
		</thead>
		<tbody>
			{#await entradas}
				<tr>Carregando resultados...</tr>
			{:then entradas}
				{#each entradas as entrada}
					<tr>
						<td>
							<a href="/financeiro/contribuinte/{entrada.contribuinte.idcontribuinte}">
								{entrada.contribuinte.nome}
							</a>
						</td>
						{#if entrada.contribuinte.trabalhador}
							<td>Trabalhador</td>
						{:else}
							<td>Eventual</td>
						{/if}
						<td
							>{Number(entrada.valor).toLocaleString('pt-BR', {
								style: 'currency',
								currency: 'BRL'
							})}</td
						>
						<td>{entrada.descricao}</td>
						<td>{dayjs(entrada.data_entrada).format('DD/MM/YYYY')}</td>
						<td>
							<a href="/financeiro/entradas/{entrada.identrada}">
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
