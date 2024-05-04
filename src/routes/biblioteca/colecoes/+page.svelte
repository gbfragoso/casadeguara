<script lang="ts">
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ colecoes } = data);
</script>

<h2>Consultar coleções</h2>

<div class="grid">
	<form action="/biblioteca/colecoes" method="GET" role="search">
		<input type="text" name="nome" id="nome" />
		<button class="outline">Pesquisar</button>
	</form>
	<a href="/biblioteca/colecoes/novo">
		<button><i class="fa-solid fa-plus">&nbsp;</i>Novo</button>
	</a>
</div>
<div class="overflow-auto">
	<table>
		<thead>
			<th>Nome</th>
			<th>Ações</th>
		</thead>
		<tbody>
			{#each colecoes as colecao}
				<tr>
					<td>{colecao.nome}</td>
					<td>
						<div class="grid" style="width: 25%">
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
		</tbody>
	</table>
</div>
