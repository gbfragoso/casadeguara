<script lang="ts">
	import Pagination from '$lib/components/Pagination.svelte';
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ colecoes, total } = data);
</script>

<div class="mb-2">
	<nav id="breadcrumb" class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/biblioteca">Biblioteca</a></li>
			<li class="is-active">
				<a href="/biblioteca/colecoes" aria-current="page">Coleções</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Consulta de coleções</h1>
</div>

<form class="card" action="/biblioteca/colecoes" method="GET">
	<div class="card-content">
		<div class="field">
			<label class="label" for="nome">Nome da coleção</label>
			<div class="control">
				<input class="input" type="text" name="nome" id="nome" placeholder="Digite o nome da coleção" />
			</div>
		</div>
		<div class="columns">
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<button class="button is-primary is-fullwidth has-text-weight-semibold" type="submit">
					<i class="fa-solid fa-magnifying-glass fa-fw">&nbsp;</i>Pesquisar
				</button>
			</div>
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<a
					data-sveltekit-reload
					class="button is-fullwidth has-text-weight-semibold"
					href="/biblioteca/colecoes/novo"><i class="fa-solid fa-plus fa-fw">&nbsp;</i>Novo</a>
			</div>
		</div>
	</div>
</form>

{#if colecoes && colecoes.length > 0}
	<div class="card">
		<div class="card-content">
			<div class="table-container">
				<table class="table is-striped is-hoverable is-fullwidth">
					<thead>
						<th>Nome</th>
						<th class="table-actions">Ações</th>
					</thead>
					<tbody>
						{#each colecoes as colecao}
							<tr>
								<td>{colecao.nome}</td>
								<td class="table-actions">
									<a href="/biblioteca/colecoes/{colecao.idserie}">
										<i class="fa-solid fa-pen-to-square fa-fw"></i>
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<Pagination {total}></Pagination>
			</div>
		</div>
	</div>
{/if}
