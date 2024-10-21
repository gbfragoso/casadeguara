<script lang="ts">
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import type { PageServerData } from './$types';
	interface Props {
		data: PageServerData;
	}

	let { data }: Props = $props();

	let { avisos, emprestimos, devolucoes } = $derived(data);
	dayjs.extend(utc);
</script>

<div>
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/biblioteca">Biblioteca</a></li>
			<li class="is-active">
				<a href="/biblioteca" aria-current="page">Página Inicial</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">
		Balanço do mês {dayjs.utc(new Date()).format('MM/YYYY')}
	</h1>
</div>
<div class="mt-2 columns">
	<div class="column">
		<div class="box has-text-weight-semibold">
			<i class="fa-solid fa-arrow-right fa-fw">&nbsp;</i>Empréstimos
			<h2 class="is-size-3 has-text-primary">
				{#await emprestimos}
					<div class="skeleton-lines">
						<div></div>
					</div>
				{:then emprestimo}
					{emprestimo[0].counter}
				{/await}
			</h2>
		</div>
	</div>
	<div class="column">
		<div class="box has-text-weight-semibold">
			<i class="fa-solid fa-arrow-left fa-fw">&nbsp;</i>Devoluções
			<h2 class="is-size-3 has-text-primary">
				{#await devolucoes}
					<div class="skeleton-lines">
						<div></div>
					</div>
				{:then devolucao}
					{devolucao[0].counter}
				{/await}
			</h2>
		</div>
	</div>
	<div class="column">
		<div class="box has-text-weight-semibold">
			<i class="fa-solid fa-repeat fa-fw">&nbsp;</i>Renovações
			<h2 class="is-size-3 has-text-primary">
				{#await emprestimos}
					<div class="skeleton-lines">
						<div></div>
					</div>
				{:then emprestimo}
					{emprestimo[0].renovacoes || 0}
				{/await}
			</h2>
		</div>
	</div>
</div>
<p class="is-size-4 mb-4 has-text-weight-semibold">Mural de avisos</p>
{#await avisos}
	<div class="skeleton-block"></div>
	<div class="skeleton-block"></div>
	<div class="skeleton-block"></div>
	<div class="skeleton-block"></div>
	<div class="skeleton-block"></div>
{:then lista}
	{#each lista as aviso}
		<div class="box">
			<div class="content">
				<p>
					<strong class="has-text-primary">{aviso.username}</strong>
					<small>{dayjs.utc(aviso.dataCadastro).format('DD/MM/YYYY')}</small>
					<br />
					{aviso.texto}
				</p>
			</div>
		</div>
	{/each}
{/await}
