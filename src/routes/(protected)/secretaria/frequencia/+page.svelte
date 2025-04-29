<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
	let loading = $state(false);
</script>

<div class="mb-2">
	<nav id="breadcrumb" class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/secretaria">Secretaria</a></li>
			<li class="is-active">
				<a href="/secretaria/frequencia" aria-current="page">Frequência</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 is-hidden-print has-text-weight-semibold has-text-primary">Lista de frequência</h1>
</div>

<form
	class="card"
	method="POST"
	use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			await update();
			loading = false;
		};
	}}>
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
				<input name="dias" value="2" type="checkbox" checked />
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
				<button
					aria-busy={loading}
					class:is-loading={loading}
					class="button is-primary is-fullwidth has-text-weight-semibold"
					type="submit">
					<i class="fa-regular fa-rectangle-list fa-fw">&nbsp;&nbsp;</i>Gerar Lista
				</button>
			</div>
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<a
					class="button is-fullwidth has-text-weight-semibold is-warning"
					href="/secretaria/frequencia/registro"><i class="fa-solid fa-plus fa-fw">&nbsp;</i>Registrar</a>
			</div>
		</div>
	</div>
</form>

{#if form?.leitores}
	<div id="printable-content" class="card">
		<div class="card-content">
			<textarea class="textarea is-size-4 has-text-weight-semibold has-text-centered" rows="3"></textarea>
			<div class="table-container">
				<table class="table is-striped is-hoverable is-fullwidth">
					<thead>
						<tr>
							{#if form.datas}
								{#each form.datas as date}
									<th class="print-pr-2">
										{date}
									</th>
								{/each}
							{/if}
							<th class="print-pl-6">Nome</th>
						</tr>
					</thead>
					<tbody>
						{#each form.leitores as leitor}
							<tr>
								{#each form.datas as _}
									<td id={_} class="print-pr-2">[&nbsp;&nbsp;]</td>
								{/each}
								<td class="print-pl-6">
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
