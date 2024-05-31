<script lang="ts">
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ colecoes } = data);
</script>

<hgroup>
	<h2 class="pico-color-azure-500">Coleções</h2>
	<p>Consulta de coleções e séries de livros</p>
</hgroup>

<div class="card">
	<form action="/biblioteca/colecoes" method="GET">
		<label for="nome">Nome da coleção:</label>
		<input type="text" name="nome" id="nome" placeholder="Digite o nome da coleção" />
		<div class="flex-container" style="width: 25%">
			<button class="outline" type="submit">
				<i class="fa-solid fa-magnifying-glass">&nbsp;</i>Pesquisar
			</button>
			<a href="/biblioteca/colecoes/novo" style="width: 100%">
				<button class="primary"><i class="fa-solid fa-plus">&nbsp;</i>Novo</button>
			</a>
		</div>
	</form>
</div>
<div class="card overflow-auto">
	<table class="striped">
		<thead>
			<th>Nome</th>
			<th>Ações</th>
		</thead>
		<tbody>
			{#await colecoes}
				<tr>Carregando coleções...</tr>
			{:then colecoes}
				{#each colecoes as colecao}
					<tr>
						<td>{colecao.nome}</td>
						<td>
							<div class="grid" style="width:60px">
								<a href="/biblioteca/colecoes/{colecao.idserie}">
									<i class="fa-solid fa-pen-to-square"></i>
								</a>
								<form action="?/excluir&id={colecao.idserie}" method="POST">
									<button><i class="fa-regular fa-trash-can"></i></button>
								</form>
							</div>
						</td>
					</tr>
				{/each}
			{:catch error}
				<tr>Erro ao carregar os resultados: {error.message}</tr>
			{/await}
		</tbody>
	</table>
</div>
