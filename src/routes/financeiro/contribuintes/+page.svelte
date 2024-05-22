<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<hgroup>
	<h2>Contribuintes</h2>
</hgroup>

<form action="/financeiro/contribuintes" method="GET" role="search">
	<input
		type="search"
		name="categoria"
		id="categoria"
		placeholder="Digite o nome do contribuinte"
	/>
	<input type="date" name="dataInicio" aria-label="Date" />
	<input type="date" name="dataFim" aria-label="Date" />
	<button class="outline" value="search">Pesquisar</button>
</form>

<div class="overflow-auto">
	<table>
		<thead>
			<th scope="col">Contribuinte</th>
			<th scope="col">Tipo</th>
			<th scope="col">Ações</th>
		</thead>
		<tbody>
			{#each data.contribuintes as contribuinte}
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
		</tbody>
	</table>
</div>
