<script lang="ts">
	import type { PageServerData } from './$types';
	interface Props {
		data: PageServerData;
	}

	let { data }: Props = $props();
	let { exemplares } = $derived(data);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/acervo">Acervo</a></li>
			<li><a href="/acervo/livros" aria-current="page">Livros</a></li>
			<li class="is-active">
				<a href="/acervo/livros/exemplares" aria-current="page">Exemplares</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Consulta de exemplares</h1>
</div>

<div class="card">
	<div class="card-content">
		<div class="table-container">
			<table class="table is-striped is-hoverable is-fullwidth">
				<thead>
					<tr>
						<th>Ex</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>
					{#await exemplares}
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
						{#each item as exemplar}
							<tr>
								<td>{exemplar.numero}</td>
								<td>
									{#if exemplar.status === 'Disponível'}
										<span class="tag is-success">{exemplar.status}</span>
									{:else}
										<span class="tag is-danger">{exemplar.status}</span>
									{/if}
								</td>
							</tr>
						{/each}
					{/await}
				</tbody>
			</table>
		</div>
	</div>
</div>
