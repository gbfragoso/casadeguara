<script lang="ts">
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import Pagination from "$lib/components/Pagination.svelte";
	
	import type { PageServerData } from "./$types";
	export let data: PageServerData;

	$: ({ entradas, total } = data);
	dayjs.extend(utc);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/financeiro">Financeiro</a></li>
			<li class="is-active">
				<a href="/financeiro/entradas" aria-current="page">Entradas</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold">Entradas</h1>
</div>

<form class="card" action="/financeiro/entradas" method="GET">
	<div class="card-content">
		<div class="field">
			<label class="label" for="contribuinte">Contribuinte</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="contribuinte"
					id="contribuinte"
					placeholder="Digite o nome do contribuinte"
				/>
			</div>
		</div>
		<div class="columns">
			<div class="field column">
				<label class="label" for="dataInicio">Data inicial</label>
				<div class="control">
					<input
						class="input"
						type="date"
						name="dataInicio"
						id="dataInicio"
						aria-label="Date"
					/>
				</div>
			</div>
			<div class="field column">
				<label class="label" for="dataFim">Data Final</label>
				<div class="control">
					<input
						class="input"
						type="date"
						name="dataFim"
						id="dataFim"
						aria-label="Date"
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
				<a class="button px-6" href="/financeiro/entradas/novo"
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
								<a
									href="/financeiro/contribuinte/{entrada
										.contribuinte.idcontribuinte}"
								>
									{entrada.contribuinte.nome}
								</a>
							</td>
							{#if entrada.contribuinte.trabalhador}
								<td>Trabalhador</td>
							{:else}
								<td>Eventual</td>
							{/if}
							<td
								>{Number(entrada.valor).toLocaleString(
									"pt-BR",
									{
										style: "currency",
										currency: "BRL",
									},
								)}</td
							>
							<td>{entrada.descricao}</td>
							<td>{dayjs.utc(entrada.data_entrada).format("DD/MM/YYYY")}</td>
							<td>
								<a
									href="/financeiro/entradas/{entrada.identrada}"
								>
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
