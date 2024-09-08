<script lang="ts">
	import Pagination from '$lib/components/Pagination.svelte';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';

	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ resultados, counter } = data);
	dayjs.extend(utc);
</script>

<div class="mb-2">
	<nav id="breadcrumb" class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/financeiro">Financeiro</a></li>
			<li class="is-active">
				<a href="/financeiro/entradas" aria-current="page">Entradas</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Entradas</h1>
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
					placeholder="Digite o nome do contribuinte" />
			</div>
		</div>
		<div class="columns">
			<div class="field column">
				<label class="label" for="dataInicio">Data inicial</label>
				<div class="control">
					<input class="input" type="date" name="dataInicio" id="dataInicio" aria-label="Date" />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="dataFim">Data Final</label>
				<div class="control">
					<input class="input" type="date" name="dataFim" id="dataFim" aria-label="Date" />
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
				<a class="button is-fullwidth has-text-weight-semibold" href="/financeiro/entradas/novo"
					><i class="fa-solid fa-plus fa-fw">&nbsp;</i>Novo</a>
			</div>
		</div>
	</div>
</form>

<div class="card">
	<div class="card-content">
		<div class="table-container">
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
					{#await resultados}
						<tr>
							<td>
								<div class="skeleton-lines"><div></div></div>
							</td>
							<td>
								<div class="skeleton-lines"><div></div></div>
							</td>
							<td>
								<div class="skeleton-lines"><div></div></div>
							</td>
							<td>
								<div class="skeleton-lines"><div></div></div>
							</td>
							<td>
								<div class="skeleton-lines"><div></div></div>
							</td>
							<td>
								<div class="skeleton-lines"><div></div></div>
							</td>
						</tr>
					{:then item}
						{#each item as resultado}
							<tr>
								<td>
									<a href="/financeiro/contribuinte/{resultado.idcontribuinte}">
										{resultado.contribuinte}
									</a>
								</td>
								{#if resultado.trabalhador}
									<td>Trabalhador</td>
								{:else}
									<td>Eventual</td>
								{/if}
								<td>{resultado.entradas.valor}</td>
								<td>{resultado.entradas.descricao}</td>
								<td>{dayjs.utc(resultado.entradas.data_entrada).format('DD/MM/YYYY')}</td>
								<td>
									<a href="/financeiro/entradas/{resultado.entradas.identrada}">
										<i class="fa-solid fa-pen-to-square fa-fw"></i>
									</a>
								</td>
							</tr>
						{/each}
					{/await}
				</tbody>
			</table>
			{#await counter}
				<Pagination total="1"></Pagination>
			{:then total}
				<Pagination total={total[0].count}></Pagination>
			{/await}
		</div>
	</div>
</div>
