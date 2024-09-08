<script lang="ts">
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';

	import type { PageServerData } from './$types';
	export let data: PageServerData;
	$: ({ leitores } = data);
	dayjs.extend(utc);
</script>

<div class="mb-2">
	<nav id="breadcrumb" class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/secretaria">Secretaria</a></li>
			<li class="is-active">
				<a href="/secretaria/aniversariantes" aria-current="page">Aniversariantes</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Lista de aniversariantes</h1>
</div>

<form class="card" method="GET">
	<div class="card-content">
		<div class="columns">
			<div class="column is-full-mobile is-10-tablet">
				<div class="select is-fullwidth">
					<select name="mes">
						<option value="01">Janeiro</option>
						<option value="02">Fevereiro</option>
						<option value="03">Março</option>
						<option value="04">Abril</option>
						<option value="05">Maio</option>
						<option value="06">Junho</option>
						<option value="07">Julho</option>
						<option value="08">Agosto</option>
						<option value="09">Setembro</option>
						<option value="10">Outubro</option>
						<option value="11">Novembro</option>
						<option value="12">Dezembro</option>
					</select>
				</div>
			</div>
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<button class="button is-primary is-fullwidth has-text-weight-semibold" type="submit">
					<i class="fa-solid fa-magnifying-glass fa-fw">&nbsp;</i>Pesquisar
				</button>
			</div>
		</div>
	</div>
</form>

<div id="printable-content" class="card">
	<div class="card-content">
		<div class="table-container">
			<table class="table is-striped is-hoverable is-fullwidth">
				<thead>
					<th>Nome</th>
					<th>Data</th>
				</thead>
				<tbody>
					{#await leitores}
						<tr>
							<td>
								<div class="skeleton-lines"><div></div></div>
							</td>
							<td>
								<div class="skeleton-lines"><div></div></div>
							</td>
						</tr>
					{:then item}
						{#each item as leitor}
							<tr>
								<td>
									{leitor.nome.toUpperCase()}
								</td>
								<td>
									{#if leitor.aniversario}
										{dayjs.utc(leitor.aniversario).format('DD/MM')}
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
