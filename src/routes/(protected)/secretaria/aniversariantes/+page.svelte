<script lang="ts">
	import { enhance } from '$app/forms';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import locale from 'dayjs/locale/pt';
	import type { ActionData } from './$types';
	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
	let loading = $state(false);
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
	<div class="is-hidden-print">
		<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Lista de aniversariantes</h1>
	</div>
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
				<button
					aria-busy={loading}
					class:is-loading={loading}
					class="button is-primary is-fullwidth has-text-weight-semibold"
					type="submit">
					<i class="fa-regular fa-rectangle-list fa-fw"></i>&nbsp;Gerar lista
				</button>
			</div>
		</div>
	</div>
</form>

{#if form?.leitores}
	<div id="printable-content" class="card">
		<div class="card-content">
			<h1 class="is-size-5 has-text-weight-semibold has-text-centered has-text-primary">
				GRUPO ESPÍRITA CASA DE GUARÁ
			</h1>
			<h2 class="is-size-6 has-text-weight-semibold has-text-centered has-text-danger is-uppercase">
				Aniversariantes do mês {dayjs.utc(form.leitores[0].aniversario).locale('pt').format('MMMM')} / {dayjs
					.utc(new Date())
					.format('YYYY')}
			</h2>
			<div class="table-container">
				<table class="table is-striped is-hoverable is-fullwidth">
					<thead>
						<tr>
							<th>Nome</th>
							<th>Data</th>
						</tr>
					</thead>
					<tbody>
						{#each form.leitores as leitor}
							<tr>
								<td>
									{leitor.nome.toUpperCase()}
									{#if leitor.desencarnado}
										<span class="has-text-weight-semibold has-text-danger">(IN MEMORIAM)</span>
									{/if}
								</td>
								<td>
									{#if leitor.aniversario}
										{dayjs.utc(leitor.aniversario).format('DD/MM')}
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
		<div
			style="position: fixed; bottom: 0;width: 100%;"
			class="is-size-6 has-text-weight-semibold has-text-centered has-text-danger">
			ATENÇÃO: Quaisquer omissões de nomes ou alterações de data favor avisar ao Ir. Carlson <br />
			(Tel (73) 98808-2447/Whatsapp) para as correções devidas
		</div>
	</div>
{/if}
