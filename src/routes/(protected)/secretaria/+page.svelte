<script lang="ts">
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import type { PageServerData } from './$types';
	export let data: PageServerData;

	$: ({ leitores, engajamento } = data);
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
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Secretaria</h1>
</div>
<div class="mt-2 columns">
	{#await leitores then leitores}
		{#await engajamento then engajamento}
			<div class="column">
				<div class="box has-text-weight-semibold">
					<i class="fa-solid fa-user fa-fw">&nbsp;</i>Trabalhadores
					<h2 class="is-size-3 has-text-primary">
						{leitores[0].counter}
					</h2>
				</div>
			</div>
			<div class="column">
				<div class="box has-text-weight-semibold">
					<i class="fa-solid fa-list-check fa-fw">&nbsp;</i>Frequência no mês {dayjs
						.utc(new Date())
						.format('MM/YYYY')}
					<h2 class="is-size-3 has-text-primary">
						{((engajamento[0].counter / (leitores[0].counter * 2 * 4)) * 100).toFixed(2)} %
					</h2>
				</div>
			</div>
		{/await}
	{/await}
</div>
<div class="box">
	<h2>Gráfico de frequência mensal</h2>
</div>
