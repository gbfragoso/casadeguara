<script lang="ts">
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ emprestimos } = data);
	dayjs.extend(utc);
</script>

<div id="breadcrumb" class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/biblioteca">Biblioteca</a></li>
			<li class="is-active">
				<a href="/biblioteca/frequencia" aria-current="page">Empréstimos</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Recibo</h1>
</div>

{#if emprestimos && emprestimos.length > 0}
	<div id="printable-content" class="card">
		<div class="card-content">
			<hr />
			<p class="is-size-5 has-text-weight-semibold">Biblioteca Batuíra - Recibo de Empréstimo</p>
			<hr />
			<div class="table-container">
				<table class="table is-striped is-hoverable is-fullwidth">
					<thead>
						<th>Tombo</th>
						<th>Título</th>
						<th>Ex.</th>
						<th>Devolução</th>
					</thead>
					<tbody>
						{#each emprestimos as emprestimo}
							<tr>
								<td>{emprestimo.tombo}</td>
								<td>{emprestimo.titulo.toUpperCase()}</td>
								<td>{emprestimo.numero}</td>
								<td>{dayjs.utc(emprestimo.data_devolucao).format('DD/MM/YYYY')}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<p class="has-text-centered">____________________________________________________</p>
			<p class="has-text-centered">{emprestimos[0].leitor}</p>
			<hr />
			<p class="has-text-centered">Fora da caridade não há salvação</p>
		</div>
	</div>
{/if}
