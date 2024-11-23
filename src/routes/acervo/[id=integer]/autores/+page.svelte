<script lang="ts">
	import type { PageServerData } from './$types';
	interface Props {
		data: PageServerData;
	}

	let { data }: Props = $props();
	let { autoresLivro } = $derived(data);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/acervo">Acervo</a></li>
			<li><a href="/acervo/livros">Livros</a></li>
			<li class="is-active">
				<a href="/acervo/livros/autores" aria-current="page">Autores</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Consulta de autores</h1>
</div>

<div class="card">
	<div class="card-content">
		<div class="table-container">
			<table class="table is-striped is-hoverable is-fullwidth">
				<thead>
					<tr>
						<th>Nome</th>
					</tr>
				</thead>
				<tbody>
					{#await autoresLivro}
						<tr>
							<td>
								<div class="skeleton-lines">
									<div></div>
								</div>
							</td>
						</tr>
					{:then item}
						{#each item as autor}
							<tr>
								<td>{autor.nome}</td>
							</tr>
						{/each}
					{/await}
				</tbody>
			</table>
		</div>
	</div>
</div>
