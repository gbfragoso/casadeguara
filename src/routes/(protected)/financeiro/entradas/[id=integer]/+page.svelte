<script lang="ts">
	import { enhance } from '$app/forms';
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
			<li class="is-active">
				<a href="/financeiro/entradas" aria-current="page">Entradas</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Atualizar os dados da doação</h1>
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
			<label class="label" for="descricao">Descrição</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="descricao"
					id="descricao"
					maxlength="200"
					value={entrada.descricao} />
				{#if form?.field === 'descricao'}
					<p class="help is-danger">{form?.message}</p>
				{/if}
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
					type="submit">Atualizar</button>
			</div>
		</div>
	</div>
</form>

{#if form?.status === 200}
	<Notification class="is-success">Doação atualizada com sucesso!</Notification>
{/if}
