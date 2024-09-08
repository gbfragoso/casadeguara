<script lang="ts">
	import Pagination from '$lib/components/Pagination.svelte';
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ keywords, counter } = data);
</script>

<div class="mb-2">
	<nav id="breadcrumb" class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/biblioteca">Biblioteca</a></li>
			<li class="is-active">
				<a href="/biblioteca/keywords" aria-current="page">Palavras-chave</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Consulta de palavras-chave</h1>
</div>

<form class="card" action="/biblioteca/keywords" method="GET">
	<div class="card-content">
		<div class="field">
			<label class="label" for="chave">Palavra-chave</label>
			<div class="control">
				<input class="input" type="text" name="chave" id="chave" placeholder="Digite a palavra-chave" />
			</div>
		</div>
		<div class="columns">
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<button class="button is-primary is-fullwidth has-text-weight-semibold" type="submit">
					<i class="fa-solid fa-magnifying-glass fa-fw">&nbsp;</i>Pesquisar
				</button>
			</div>
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<a class="button is-fullwidth has-text-weight-semibold" href="/biblioteca/keywords/novo"
					><i class="fa-solid fa-plus fa-fw">&nbsp;</i>Novo</a>
			</div>
		</div>
	</div>
</form>

<div class="card">
	<div class="card-content">
		<div class="table-container">
			<table class="table is-striped is-hoverable is-fullwidth">
				<thead>
					<th>chave</th>
					<th class="table-actions">Ações</th>
				</thead>
				<tbody>
					{#await keywords}
						<tr>
							<td>
								<div class="skeleton-lines"><div></div></div>
							</td>
							<td>
								<div class="skeleton-lines"><div></div></div>
							</td>
						</tr>
					{:then item}
						{#each item as keyword}
							<tr>
								<td>{keyword.chave}</td>
								<td class="table-actions">
									<a href="/biblioteca/keywords/{keyword.idkeyword}">
										<i class="fa-solid fa-pen-to-square fa-fw"></i>
									</a>
								</td>
							</tr>
						{/each}
					{/await}
				</tbody>
			</table>
			{#await counter}
				<Pagination total="1"></Pagination>
			{:then total}
				<Pagination total={total[0].count}></Pagination>
			{/await}
		</div>
	</div>
</div>
