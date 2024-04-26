<script lang="ts">
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ editoras } = data);
</script>

<div>Consulta de editoras</div>

<form action="/biblioteca/editoras" method="GET">
	<input type="text" name="nome" id="nome" />
	<button>Pesquisar</button>
</form>
<a href="/biblioteca/editoras/novo">
	<button>Novo</button>
</a>
<table>
	<thead>
		<th>Nome</th>
		<th>Ações</th>
	</thead>
	<tbody>
		{#each editoras as editora}
			<tr>
				<td>{editora.nome}</td>
				<td>
					<a href="/biblioteca/editoras/{editora.ideditora}">
                        <i class="fa-solid fa-pen-to-square">Editar</i>
                    </a>
					<form action="?/excluir&id={editora.ideditora}" method="POST">
						<button><i class="fa-regular fa-trash-can">Excluir</i></button>
					</form>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
