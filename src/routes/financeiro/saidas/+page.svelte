<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;

    $: ({ saidas } = data);

	function formatarData(date: string) {
		return new Date(date)
			.toLocaleString('pt-BR', {
				dateStyle: 'short',
				timeStyle: 'long',
				timeZone: 'America/Sao_Paulo'
			})
			.substring(0, 10);
	}
</script>

<hgroup>
	<h2>Despesas</h2>
	<p>Listagem de despesas</p>
</hgroup>

<form action="/financeiro/saidas" method="GET" role="search">
	<input type="search" name="categoria" id="categoria" placeholder="Digite a categoria de despesa" />
	<input type="date" name="dataInicio" aria-label="Date" />
	<input type="date" name="dataFim" aria-label="Date" />
	<button class="outline" value="search">Pesquisar</button>
</form>

<a href="/financeiro/saidas/novo">
	<button><i class="fa-solid fa-plus">&nbsp;</i>Novo</button>
</a>

<div class="overflow-auto">
	<table>
		<thead>
			<th scope="col">Valor</th>
			<th scope="col">Categoria</th>
			<th scope="col">Data</th>
			<th scope="col">Ações</th>
		</thead>
		<tbody>
			{#each saidas as saida}
				<tr>
					<td>R$ {saida.valor}</td>
					<td>R$ {saida.categoria}</td>
					<td>{formatarData(saida.data_saida)}</td>
					<td>
						<a href="/financeiro/saidas/{saida.idsaida}">
							<i class="fa-solid fa-pen-to-square"></i>
						</a>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
