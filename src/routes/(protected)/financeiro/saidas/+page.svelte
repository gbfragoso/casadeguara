<script lang="ts">
	import dayjs from "dayjs";
	import utc from "dayjs/plugin/utc";
	import Pagination from "$lib/components/Pagination.svelte";
	import type { PageServerData } from "./$types";

	export let data: PageServerData;
	$: ({ saidas, total } = data);
	dayjs.extend(utc);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/financeiro">Financeiro</a></li>
			<li class="is-active">
				<a href="/financeiro/saidas" aria-current="page">Saídas</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold">Saídas</h1>
</div>

<form class="card" action="/financeiro/saidas" method="GET">
	<div class="card-content">
		<div class="field">
			<label class="label" for="descricao">Descrição</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="descricao"
					id="descricao"
					placeholder="Descrição da despesa"
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
				<a
					data-sveltekit-reload
					class="button px-6"
					href="/financeiro/saidas/novo"
					><i class="fa-solid fa-plus">&nbsp;</i>Novo</a
				>
			</div>
		</div>
	</div>
</form>

{#if saidas.length > 0}
	<div class="card">
		<div class="card-content">
			<table class="table is-striped is-hoverable is-fullwidth">
				<thead>
					<th scope="col">Descrição</th>
					<th scope="col">Valor</th>
					<th scope="col">Data</th>
					<th scope="col">Ações</th>
				</thead>
				<tbody>
					{#each saidas as saida}
						<tr>
							<td>{saida.descricao}</td>
							<td>R$ {saida.valor}</td>
							<td
								>{dayjs
									.utc(saida.data_saida)
									.format("DD/MM/YYYY")}</td
							>
							<td>
								<a
									data-sveltekit-reload
									href="/financeiro/saidas/{saida.idsaida}"
								>
									<i class="fa-solid fa-pen-to-square"></i>
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
			<Pagination {total}></Pagination>
		</div>
	</div>
{/if}
