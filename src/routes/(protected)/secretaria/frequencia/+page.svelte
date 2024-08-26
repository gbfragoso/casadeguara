<script lang="ts">
	import type { PageServerData } from './$types';
	export let data: PageServerData;
	$: ({ leitores, datas } = data);
</script>

<div id="breadcrumb" class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/secretaria">Secretaria</a></li>
			<li class="is-active">
				<a href="/secretaria/frequencia" aria-current="page">Frequência</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Lista de frequência</h1>
</div>

<form class="card" method="GET">
	<div class="card-content">
		<div class="columns">
			<div class="column">
				<div class="field">
					<label class="label" for="dataInicio">Data inicial</label>
					<div class="control">
						<input class="input" type="date" name="dataInicio" id="dataInicio" aria-label="Date" required />
					</div>
				</div>
			</div>
			<div class="column">
				<div class="field">
					<label class="label" for="dataFim">Data final</label>
					<div class="control">
						<input class="input" type="date" name="dataFim" id="dataFim" aria-label="Date" required />
					</div>
				</div>
			</div>
		</div>
		<div class="mb-3 checkboxes">
			<label class="checkbox">
				<input name="dias" value="1" type="checkbox" checked />
				Segunda
			</label>

			<label class="checkbox">
				<input name="dias" value="2" type="checkbox" />
				Terça
			</label>

			<label class="checkbox">
				<input name="dias" value="3" type="checkbox" />
				Quarta
			</label>

			<label class="checkbox">
				<input name="dias" value="4" type="checkbox" checked />
				Quinta
			</label>

			<label class="checkbox">
				<input name="dias" value="5" type="checkbox" />
				Sexta
			</label>

			<label class="checkbox">
				<input name="dias" value="6" type="checkbox" />
				Sábado
			</label>

			<label class="checkbox">
				<input name="dias" value="0" type="checkbox" />
				Domingo
			</label>
		</div>
		<div class="columns">
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<button class="button is-primary is-fullwidth has-text-weight-semibold" type="submit">
					<i class="fa-solid fa-magnifying-glass fa-fw">&nbsp;</i>Pesquisar
				</button>
			</div>
		</div>
	</div>
</form>

{#if datas && datas.length > 0 && leitores && leitores.length > 0}
	<div id="printable-content" class="card">
		<div id="printable-title" class="is-size-4 has-text-weight-semibold has-text-centered" style="display: none">
			Lista de frequência
		</div>
		<div class="card-content">
			<div class="table-container">
				<table class="table is-striped is-hoverable is-fullwidth">
					<thead>
						{#each datas as date}
							<th>
								{date}
							</th>
						{/each}
						<th>Nome</th>
					</thead>
					<tbody>
						{#each leitores as leitor}
							<tr>
								{#each datas as _}
									<td>[&nbsp;&nbsp;]</td>
								{/each}
								<td>
									{leitor.nome.toUpperCase()}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
{/if}
