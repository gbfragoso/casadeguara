<script lang="ts">
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ leitores } = data);
</script>

<div>Consulta de leitores</div>

<form action="/biblioteca/leitores" method="GET">
	<input type="text" name="nome" id="nome" />
	<button>Pesquisar</button>
</form>
<a href="/biblioteca/leitores/novo">
	<button>Novo</button>
</a>
<table>
	<thead>
		<th>Nome</th>
		<th>Trabalhador</th>
		<th>Status</th>
		<th>Ações</th>
	</thead>
	<tbody>
		{#each leitores as leitor}
			<tr>
				<td>{leitor.nome}</td>
				{#if leitor.trab}
					<td>Sim</td>
				{:else}
					<td>Não</td>
				{/if}
				{#if leitor.status}
					<td>Ativo</td>
				{:else}
					<td>Inativo</td>
				{/if}
				<td>
					<a href="/biblioteca/leitores/{leitor.idleitor}">
						<i class="fa-solid fa-pen-to-square">Editar</i>
					</a>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
