<script lang="ts">
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ livros } = data);
</script>

<div>Consulta de livros</div>

<form action="/biblioteca/livros" method="GET">
	<label for="titulo">Título</label>
	<input type="text" name="titulo" id="titulo" />
	<label for="tombo">Tombo</label>
	<input type="text" name="tombo" id="tombo" />
	<label for="tombo">Autor</label>
	<input type="text" name="autor" id="autor" />
	<label for="tombo">Editora</label>
	<input type="text" name="editora" id="editora" />
	<label for="tombo">Coleção</label>
	<input type="text" name="serie" id="serie" />
	<button>Pesquisar</button>
</form>
<a href="/biblioteca/livros/novo">
	<button>Novo</button>
</a>
<table>
	<thead>
		<th>Tombo</th>
		<th>Título</th>
		<th>Editora</th>
		<th>Série</th>
		<th>Ações</th>
	</thead>
	<tbody>
		{#each livros as livro}
			<tr>
				<td>{livro.tombo}</td>
				<td>{livro.titulo}</td>
				<td>{livro.editora_livro_editoraToeditora?.nome || ''}</td>
				<td>{livro.serie_livro_serieToserie?.nome || ''}</td>
				<td>
					<a href="/biblioteca/livros/{livro.idlivro}">
                        <i class="fa-solid fa-pen-to-square">Editar</i>
                    </a>
					<form action="?/excluir&id={livro.idlivro}" method="POST">
						<button><i class="fa-regular fa-trash-can">Excluir</i></button>
					</form>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
