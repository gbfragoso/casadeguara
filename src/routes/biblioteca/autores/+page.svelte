<script lang="ts">
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ autores } = data);
</script>

<hgroup>
	<h2 class="pico-color-azure-500">Autores</h2>
	<p>Consulta de autores</p>
</hgroup>

<div class="card">
	<form action="/biblioteca/autores" method="GET">
		<label for="nome">Nome do autor:</label>
		<input type="text" name="nome" id="nome" placeholder="Digite o nome do autor" />
		<div class="flex-container" style="width: 25%">
			<button class="outline" type="submit">
				<i class="fa-solid fa-magnifying-glass">&nbsp;</i>Pesquisar
			</button>
			<a href="/biblioteca/autores/novo" style="width: 100%">
				<button class="primary"><i class="fa-solid fa-plus">&nbsp;</i>Novo</button>
			</a>
		</div>
	</form>
</div>
<div class="card overflow-auto">
	<table class="striped">
		<thead class="pico-background-azure-500">
			<th>Nome</th>
			<th>Ações</th>
		</thead>
		<tbody>
			{#await autores}
				<tr>Carregando autores...</tr>
			{:then}
				{#each autores as autor}
					<tr>
						<td>{autor.nome}</td>
						<td>
							<a href="/biblioteca/autores/{autor.idautor}">
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
