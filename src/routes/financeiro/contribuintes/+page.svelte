<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<section>
	<h2>Contribuintes</h2>
	<table>
		<thead>
			<th scope="col">Contribuinte</th>
			<th scope="col">Tipo</th>
			<th scope="col">Ações</th>
		</thead>
		<tbody>
			{#each data.contribuintes as contribuinte}
				<tr>
					<td>{contribuinte.nome}</td>
					{#if contribuinte.trabalhador}
						<td>Trabalhador</td>
					{:else}
						<td>Eventual</td>
					{/if}
					<td>
						<form method="POST">
							<button formaction="?/editar"><i class="fa-solid fa-pen-to-square">Editar</i></button>
							<button formaction="?/excluir"><i class="fa-regular fa-trash-can">Excluir</i></button>
						</form>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</section>
