<script lang="ts">
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ exemplares } = data);
</script>

<div>Consulta de exemplares</div>

<form action="/biblioteca/exemplares" method="GET">
	<label for="titulo">Título</label>
	<input type="text" name="titulo" id="titulo" />
	<label for="tombo">Tombo</label>
	<input type="text" name="tombo" id="tombo" />
	<select name="status" id="status">
		<option value="Disponível">Disponível</option>
		<option value="Emprestado">Emprestado</option>
	</select>
	<button>Pesquisar</button>
</form>
<a href="/biblioteca/exemplares/novo">
	<button>Novo</button>
</a>
<table>
	<thead>
		<th>Tombo</th>
		<th>Título</th>
		<th>Ex</th>
		<th>Status</th>
		<th>Ações</th>
	</thead>
	<tbody>
		{#each exemplares as exemplar}
			<tr>
				<td>{exemplar.livro_exemplar_livroTolivro.tombo}</td>
				<td>{exemplar.livro_exemplar_livroTolivro.titulo}</td>
				<td>{exemplar.numero}</td>
				<td>{exemplar.status}</td>
				<td>
					<a href="/biblioteca/exemplares/{exemplar.idexemplar}">
						<i class="fa-solid fa-pen-to-square">Editar</i>
					</a>
					<form action="?/excluir&id={exemplar.idexemplar}" method="POST">
						<button><i class="fa-regular fa-trash-can">Excluir</i></button>
					</form>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
