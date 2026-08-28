<script lang="ts">
	import { resolve } from '$app/paths';
	import Notification from '$lib/components/feedback/Notification.svelte';
	import { createFormEnhancer } from '$lib/forms/enhancer.svelte';
	import type { ActionData } from './$types';

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
	const formEnhancer = createFormEnhancer();
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href={resolve('/biblioteca')}>Biblioteca</a></li>
			<li class="is-active">
				<a href={resolve('/biblioteca/keywords')} aria-current="page">Palavras-chave</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Cadastrar palavra-chave</h1>
</div>

<form class="card" method="POST" {@attach formEnhancer.submitWithLoading}>
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
				aria-busy={formEnhancer.loading}
				class={['button is-primary has-text-weight-semibold', { 'is-loading': formEnhancer.loading }]}
				type="submit">Cadastrar</button>
		</div>
	</div>
</form>

{#if form?.status === 201}
	<Notification class="is-success">Palavra-chave cadastrada com sucesso!</Notification>
{/if}
