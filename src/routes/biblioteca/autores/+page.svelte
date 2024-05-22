<script lang="ts">
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ autores } = data);
</script>

<h2>Consultar autores</h2>

<div class="grid">
	<form action="/biblioteca/autores" method="GET" role="search">
		<input type="search" name="nome" id="nome" placeholder="Digite o nome do autor" />
		<button class="outline" value="search">Pesquisar</button>
	</form>
	<a href="/biblioteca/autores/novo">
		<button><i class="fa-solid fa-plus">&nbsp;</i>Novo</button>
	</a>
</div>
<div class="overflow-auto">
	<table class="striped">
		<thead class="pico-background-azure-500">
			<th>Nome</th>
			<th>Ações</th>
		</thead>
		<tbody>
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
		</tbody>
	</table>
</div>
