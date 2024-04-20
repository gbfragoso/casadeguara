<script lang="ts">
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ autores } = data);
</script>

<div>Consulta autores</div>

<form action="/biblioteca/autores" method="GET">
	<input type="text" name="nome" id="nome" />
	<button>Pesquisar</button>
</form>
<a href="/biblioteca/autores/novo">
	<button>Novo</button>
</a>
<table>
	<thead>
		<th>Nome</th>
		<th>Ações</th>
	</thead>
	<tbody>
		{#each autores as autor}
			<tr>
				<td>{autor.nome}</td>
				<td>
					<a href="/biblioteca/autores/{autor.idautor}">
                        <i class="fa-solid fa-pen-to-square">Editar</i>
                    </a>
					<form action="?/excluir&id={autor.idautor}" method="POST">
						<button><i class="fa-regular fa-trash-can">Excluir</i></button>
					</form>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
