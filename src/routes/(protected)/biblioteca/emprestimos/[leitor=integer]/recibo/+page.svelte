<script lang="ts">
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import type { PageServerData } from './$types';
	interface Props {
		data: PageServerData;
	}

	let { data }: Props = $props();
	let { emprestimos } = $derived(data);
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
			<hr class="mb-2 mt-0 double" />
			<div class="is-flex is-flex-direction-row is-justify-content-space-between">
				<div class="has-text-weight-semibold">Biblioteca Batuíra - Recibo de Empréstimo</div>
				<div class="has-text-weight-semibold">{dayjs().format('DD/MM/YYYY')}</div>
			</div>
			<hr class="mt-2 mb-0 double" />
			<div class="is-flex is-flex-direction-row is-justify-content-flex-end">
				<div class="mr-6">Renovado para</div>
				<div class="mr-6">Recebido por</div>
			</div>
			<hr class="mt-2 mb-0" />
			{#each emprestimos as emprestimo}
				<div>
					<div class="is-flex is-flex-direction-row is-justify-content-space-between">
						<span>{emprestimo.tombo}&nbsp;&nbsp;&nbsp;{emprestimo.titulo.toUpperCase()}</span>
						<span class="mr-5">_____________________&nbsp;&nbsp;_____________________</span>
					</div>
					<div class="is-flex is-flex-direction-row is-justify-content-space-between">
						<span
							>Data de devolução: {dayjs
								.utc(emprestimo.data_devolucao)
								.format(
									'DD/MM/YYYY',
								)}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Ex:&nbsp;{emprestimo.numero}</span>
						<span class="mr-5">_____/_______/_______&nbsp;&nbsp;_____/_______/_______</span>
					</div>
				</div>
			{/each}

			<div id="footer-content" class="mt-6">
				<p class="has-text-centered">____________________________________________________</p>
				<p class="has-text-centered">{emprestimos[0].leitor}</p>
				<hr class="mb-1 mt-3 double" />
				<p class="has-text-centered">Fora da caridade não há salvação</p>
			</div>
		</div>
	</div>
	<button
		class="button is-outlined is-primary is-hidden-print"
		aria-label="print"
		onclick={() => {
			window.print();
		}}>Clique aqui para imprimir</button>
{/if}
