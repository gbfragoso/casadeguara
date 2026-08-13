<script lang="ts">
	import { enhance } from '$app/forms';
	import Notification from '$lib/components/Notification.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { fromAction } from 'svelte/attachments';
	import type { ActionData } from './$types';
	type SubmitCallback = Exclude<Awaited<ReturnType<SubmitFunction>>, void>;

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
	let loading = $state(false);

	function handleSubmit(): SubmitCallback {
		loading = true;

		return async ({ update }) => {
			try {
				await update();
			} finally {
				loading = false;
			}
		};
	}
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/biblioteca">Biblioteca</a></li>
			<li class="is-active">
				<a href="/biblioteca/keywords" aria-current="page">Palavras-chave</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Cadastrar palavra-chave</h1>
</div>

<form class="card" method="POST" {@attach fromAction(enhance, () => handleSubmit)}>
	<div class="card-content">
		<div class="field">
			<label class="label" for="chave">Palavra-chave</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="chave"
					id="chave"
					value={form?.values?.chave ?? ''}
					placeholder="Digite a palavra-chave"
					maxlength="30"
					required
					aria-describedby={form?.errors?.chave?.length ? 'chave-errors' : undefined}
					aria-invalid={form?.errors?.chave?.length ? 'true' : undefined} />
			</div>
			{#if form?.errors?.chave?.length}
				<div id="chave-errors" class="help is-danger">
					{#each form.errors.chave as message (message)}
						<p>{message}</p>
					{/each}
				</div>
			{/if}
		</div>
		<div class="control">
			<button
				aria-busy={loading}
				class={['button is-primary has-text-weight-semibold', { 'is-loading': loading }]}
				type="submit">Cadastrar</button>
		</div>
	</div>
</form>

{#if form?.status === 201}
	<Notification class="is-success">Palavra-chave cadastrada com sucesso!</Notification>
{/if}
