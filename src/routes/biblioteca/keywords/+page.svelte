<script lang="ts">
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ keywords } = data);
</script>

<hgroup>
	<h2 class="pico-color-azure-500">Palavras-chave</h2>
	<p>Consulta de palavras-chave</p>
</hgroup>

<div class="card">
	<form action="/biblioteca/keywords" method="GET">
		<label for="chave">Palavra-chave:</label>
		<input type="text" name="chave" id="chave" placeholder="Digite uma tema ou palavra-chave" />
		<div class="flex-container" style="width: 25%">
			<button class="outline" type="submit">
				<i class="fa-solid fa-magnifying-glass">&nbsp;</i>Pesquisar
			</button>
			<a href="/biblioteca/keywords/novo" style="width: 100%">
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
			{#await keywords}
				<tr>Carregando lista de palavras-chave</tr>
			{:then keywords}
				{#each keywords as keyword}
					<tr>
						<td>{keyword.chave}</td>
						<td>
							<div class="grid" style="width: 60px">
								<a href="/biblioteca/keywords/{keyword.idkeyword}">
									<i class="fa-solid fa-pen-to-square"></i>
								</a>
								<form action="?/excluir&id={keyword.idkeyword}" method="POST">
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
