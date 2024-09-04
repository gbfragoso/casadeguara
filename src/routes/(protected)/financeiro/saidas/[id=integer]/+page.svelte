<script lang="ts">
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import type { ActionData, PageServerData } from './$types';

	export let data: PageServerData;
	export let form: ActionData;

	$: ({ saida } = data);
	dayjs.extend(utc);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/financeiro">Financeiro</a></li>
			<li class="is-active">
				<a href="/financeiro/saidas" aria-current="page">saidas</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Atualizar os dados do pagamento</h1>
</div>

<form class="card" action="?/update" method="POST">
	<div class="card-content">
		<div class="field">
			<label class="label" for="descricao">Descrição</label>
			<div class="control">
				<input class="input" type="text" name="descricao" id="descricao" value={saida.descricao} />
				{#if form?.field === 'descricao'}
					<p class="help is-danger">{form?.message}</p>
				{/if}
			</div>
		</div>
		<div class="columns">
			<div class="field column">
				<label class="label" for="valor">Valor</label>
				<div class="control">
					<input class="input" type="number" name="valor" id="valor" value={saida.valor} step=".01" />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="data_saida">Data do pagamento</label>
				<div class="control">
					<input
						class="input"
						type="date"
						name="data_saida"
						value={dayjs.utc(saida.data_saida).format('YYYY-MM-DD')} />
				</div>
			</div>
		</div>
		<div class="field">
			<div class="control">
				<button class="button is-primary has-text-weight-semibold" type="submit">Atualizar</button>
			</div>
		</div>
	</div>
</form>

{#if form?.status === 200}
	<div class="notification is-success">
		<p>Pagamento atualizado com sucesso!</p>
	</div>
{/if}
