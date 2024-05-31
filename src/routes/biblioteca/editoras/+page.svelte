<script lang="ts">
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ editoras } = data);
</script>

<hgroup>
	<h2 class="pico-color-azure-500">Editoras</h2>
	<p>Consulta de editoras</p>
</hgroup>

<div class="card">
	<form action="/biblioteca/editoras" method="GET">
		<input type="text" name="nome" id="nome" />
		<div class="flex-container" style="width: 25%">
			<button class="outline" type="submit">
				<i class="fa-solid fa-magnifying-glass">&nbsp;</i>Pesquisar
			</button>
			<a href="/biblioteca/editoras/novo" style="width: 100%">
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
			{#await editoras}
				<tr>Carregando editoras...</tr>
			{:then editoras}
				{#each editoras as editora}
					<tr>
						<td>{editora.nome}</td>
						<td>
							<div class="grid" style="width:60px">
								<a href="/biblioteca/editoras/{editora.ideditora}">
									<i class="fa-solid fa-pen-to-square"></i>
								</a>
								<form action="?/excluir&id={editora.ideditora}" method="POST">
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
