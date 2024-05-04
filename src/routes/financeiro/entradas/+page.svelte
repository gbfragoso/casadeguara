<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;

    $: ({ entradas } = data);

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
	<h2>Entradas</h2>
	<p>Lista de doações e/ou valores recebidos por contribuinte</p>
</hgroup>

<form action="/financeiro/entradas" method="GET" role="search">
	<input type="search" name="nome" id="nome" placeholder="Digite o nome do contribuinte" />
	<input type="date" name="dataInicio" aria-label="Date" />
	<input type="date" name="dataFim" aria-label="Date" />
	<button class="outline" value="search">Pesquisar</button>
</form>

<a href="/financeiro/entradas/novo">
	<button><i class="fa-solid fa-plus">&nbsp;</i>Novo</button>
</a>

<div class="overflow-auto">
	<table>
		<thead>
			<th scope="col">Contribuinte</th>
			<th scope="col">Valor</th>
			<th scope="col">Data</th>
			<th scope="col">Ações</th>
		</thead>
		<tbody>
			{#each entradas as entrada}
				<tr>
					<td>{entrada.contribuinte_entradas_contribuinteTocontribuinte?.nome}</td>
					<td>R$ {entrada.valor}</td>
					<td>{formatarData(entrada.data_entrada)}</td>
					<td>
						<a href="/financeiro/entradas/{entrada.identrada}">
							<i class="fa-solid fa-pen-to-square"></i>
						</a>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
