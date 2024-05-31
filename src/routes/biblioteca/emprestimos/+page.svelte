<script lang="ts">
	import dayjs from 'dayjs';
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ emprestimos } = data);
</script>

<hgroup>
	<h2 class="pico-color-azure-500">Empréstimos</h2>
	<p>Consulta de empréstimos</p>
</hgroup>

<div class="card">
	<form action="/biblioteca/emprestimos" method="GET">
		<div class="grid">
			<label
				>Leitor:
				<input type="text" name="leitor" id="leitor" placeholder="Digite o nome do leitor" />
			</label>
			<label
				>Títuto:
				<input type="text" name="titulo" id="titulo" placeholder="Digite o título da obra" />
			</label>
		</div>
		<div class="flex-container">
			<label
				>Somente ativos
				<input type="checkbox" name="ativos" id="ativos" checked />
			</label>
			<label
				>Somente atrasados
				<input type="checkbox" name="atrasados" id="atrasados" />
			</label>
		</div>
		<div class="flex-container" style="width: 25%">
			<button class="outline" type="submit">
				<i class="fa-solid fa-magnifying-glass">&nbsp;</i>Pesquisar
			</button>
			<a href="/biblioteca/emprestimos/novo" style="width: 100%">
				<button class="primary"><i class="fa-solid fa-plus">&nbsp;</i>Novo</button>
			</a>
		</div>
	</form>
</div>

<div class="card overflow-auto">
	<table class="striped">
		<thead>
			<th>Leitor</th>
			<th>Título</th>
			<th>Ex</th>
			<th>Empréstimo</th>
			<th>Prazo</th>
		</thead>
		<tbody>
			{#await emprestimos}
				<tr>Carregando lista de empréstimos</tr>
			{:then emprestimos}
				{#each emprestimos as emprestimo}
					<tr>
						<td>
							<a href="/biblioteca/leitores/{emprestimo.leitor_emprestimo_leitorToleitor.idleitor}">
								{emprestimo.leitor_emprestimo_leitorToleitor.nome}
							</a>
						</td>
						<td
							>{emprestimo.exemplar_emprestimo_exemplarToexemplar.livro_exemplar_livroTolivro
								.titulo}</td
						>
						<td>{emprestimo.exemplar_emprestimo_exemplarToexemplar.numero}</td>
						<td>{dayjs(emprestimo.data_emprestimo).format('DD/MM/YYYY')}</td>
						<td>{dayjs(emprestimo.data_devolucao).format('DD/MM/YYYY')}</td>
					</tr>
				{/each}
			{:catch error}
				<tr>Erro ao carregar os resultados: {error.message}</tr>
			{/await}
		</tbody>
	</table>
</div>
