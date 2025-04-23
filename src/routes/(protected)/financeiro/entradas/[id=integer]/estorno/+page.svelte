<script lang="ts">
	import { enhance } from '$app/forms';
	import { moeda } from '$lib/js/currency';
	import Notification from '$lib/components/Notification.svelte';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import type { ActionData, PageServerData } from './$types';

	interface Props {
		data: PageServerData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	let loading = $state(false);
	let { entrada } = $derived(data);
	dayjs.extend(utc);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/financeiro">Financeiro</a></li>
			<li><a href="/financeiro/entradas">Entradas</a></li>
			<li class="is-active">
				<a href="/financeiro/entradas/estorno" aria-current="page">Estorno</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Estorno</h1>
</div>

<form
	class="card"
	action="?/update"
	method="POST"
	use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			await update();
			loading = false;
		};
	}}>
	<div class="card-content">
		<div class="field">
			<label class="label" for="contribuinte">Contribuinte</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="contribuinte"
					id="contribuinte"
					readonly
					disabled
					value={entrada.contribuinte} />
			</div>
		</div>
		<div class="field">
			<label class="label" for="descricao">Descrição</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="descricao"
					id="descricao"
					readonly
					disabled
					value={entrada.descricao} />
			</div>
		</div>
		<div class="field">
			<label class="label" for="descricao">Valor</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="valor"
					id="valor"
					readonly
					disabled
					value={moeda(Number(entrada.valor))} />
			</div>
		</div>
		<div class="field">
			<label class="label" for="descricao">Motivo do estorno</label>
			<div class="control">
				<input class="input" type="text" name="motivo" id="motivo" required maxlength="200" />
			</div>
		</div>
		<p class="mb-2 has-text-centered">
			Registrado no sistema por <strong>{entrada.usuarioCadastro}</strong> em
			<strong>{dayjs.utc(entrada.dataRegistro).format('DD/MM/YYYY')}</strong>
		</p>
		<div class="field">
			<div class="control">
				<button
					aria-busy={loading}
					class:is-loading={loading}
					class="button is-primary has-text-weight-semibold"
					type="submit">Estornar</button>
			</div>
		</div>
	</div>
</form>

{#if form?.status === 200}
	<Notification class="is-success">Lançamento estornado com sucesso</Notification>
{/if}
