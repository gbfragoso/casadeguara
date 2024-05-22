<script lang="ts">
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ keywords } = data);
</script>

<div>Consulta de palavras-chave</div>

<form action="/biblioteca/keywords" method="GET">
	<input type="text" name="nome" id="nome" />
	<button>Pesquisar</button>
</form>
<a href="/biblioteca/keywords/novo">
	<button>Novo</button>
</a>
<table>
	<thead>
		<th>Nome</th>
		<th>Ações</th>
	</thead>
	<tbody>
		{#each keywords as keyword}
			<tr>
				<td>{keyword.chave}</td>
				<td>
					<a href="/biblioteca/keywords/{keyword.idkeyword}">
						<i class="fa-solid fa-pen-to-square">Editar</i>
					</a>
					<form action="?/excluir&id={keyword.idkeyword}" method="POST">
						<button><i class="fa-regular fa-trash-can">Excluir</i></button>
					</form>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
