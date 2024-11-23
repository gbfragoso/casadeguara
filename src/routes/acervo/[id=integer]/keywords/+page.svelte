<script lang="ts">
	import type { PageServerData } from './$types';
	interface Props {
		data: PageServerData;
	}

	let { data }: Props = $props();
	let { keywordsLivro } = $derived(data);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/acervo">Acervo</a></li>
			<li><a href="/acervo/livros">Livros</a></li>
			<li class="is-active">
				<a href="/acervo/livros/keywords" aria-current="page">Palavras-Chave</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Consulta de palavras-chave</h1>
</div>

<div class="card">
	<div class="card-content">
		<div class="table-container">
			<table class="table is-striped is-hoverable is-fullwidth">
				<thead>
					<tr>
						<th>Palavra-chave</th>
						<th>Referência</th>
					</tr>
				</thead>
				<tbody>
					{#await keywordsLivro}
						<tr>
							<td>
								<div class="skeleton-lines">
									<div></div>
								</div>
							</td>
							<td>
								<div class="skeleton-lines">
									<div></div>
								</div>
							</td>
						</tr>
					{:then item}
						{#each item as keyword}
							<tr>
								<td>{keyword.chave}</td>
								<td>{keyword.referencia}</td>
							</tr>
						{/each}
					{/await}
				</tbody>
			</table>
		</div>
	</div>
</div>
