<script lang="ts">
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ leitores } = data);
</script>

<hgroup>
	<h2 class="pico-color-azure-500">Leitores</h2>
	<p>Consulta de leitores</p>
</hgroup>

<div class="card">
	<form action="/biblioteca/leitores" method="GET">
		<label for="nome">Nome do leitor:</label>
		<input type="text" name="nome" id="nome" placeholder="Digite o nome do leitor" />
		<div class="flex-container" style="width: 25%">
			<button class="outline" type="submit">
				<i class="fa-solid fa-magnifying-glass">&nbsp;</i>Pesquisar
			</button>
			<a href="/biblioteca/leitores/novo" style="width: 100%">
				<button class="primary"><i class="fa-solid fa-plus">&nbsp;</i>Novo</button>
			</a>
		</div>
	</form>
</div>

<div class="card overflow-auto">
	<table class="striped">
		<thead>
			<th>Nome</th>
			<th>Trabalhador</th>
			<th>Status</th>
			<th>Ações</th>
		</thead>
		<tbody>
			{#await leitores}
				<tr>Carregando lista de leitores...</tr>
			{:then leitores}
				{#each leitores as leitor}
					<tr>
						<td>{leitor.nome}</td>
						{#if leitor.trab}
							<td>Sim</td>
						{:else}
							<td>Não</td>
						{/if}
						{#if leitor.status}
							<td>Ativo</td>
						{:else}
							<td>Inativo</td>
						{/if}
						<td>
							<a href="/biblioteca/leitores/{leitor.idleitor}">
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
</div>
