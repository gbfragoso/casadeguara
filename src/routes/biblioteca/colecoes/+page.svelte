<script lang="ts">
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ colecoes } = data);
</script>

<div>Consulta coleções</div>

<form action="/biblioteca/colecoes" method="GET">
	<input type="text" name="nome" id="nome" />
	<button>Pesquisar</button>
</form>
<a href="/biblioteca/colecoes/novo">
	<button>Novo</button>
</a>
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
					<a href="/biblioteca/colecoes/{colecao.idserie}">
                        <i class="fa-solid fa-pen-to-square">Editar</i>
                    </a>
					<form action="?/excluir&id={colecao.idserie}" method="POST">
						<button><i class="fa-regular fa-trash-can">Excluir</i></button>
					</form>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
