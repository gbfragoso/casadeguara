<script lang="ts">
	import { resolve } from '$app/paths';
	import Notification from '$lib/components/feedback/Notification.svelte';
	import { createFormEnhancer } from '$lib/forms/enhancer.svelte';
	import { NOTICE_TEXT_MAX_LENGTH } from '$lib/validation/aviso';
	import type { ActionData, PageData } from './$types';

	interface Props {
		data: PageData;
		form?: ActionData;
	}

	let { data, form }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let errorMessages = $derived(form?.errors?.texto ?? []);
	let submittedText = $derived(form?.values?.texto ?? data.aviso.texto);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href={resolve('/biblioteca')}>Biblioteca</a></li>
			<li class="is-active">
				<a href={resolve('/biblioteca/avisos')} aria-current="page">Avisos</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Atualizar aviso</h1>
</div>

<form class="card" method="POST" {@attach formEnhancer.submitWithLoading}>
	<div class="card-content">
		<div class="field">
			<label class="label" for="texto">Texto do aviso</label>
			<div class="control">
				<textarea
					class="textarea has-fixed-size"
					name="texto"
					id="texto"
					placeholder="Digite o texto do aviso"
					required
					maxlength={NOTICE_TEXT_MAX_LENGTH}
					aria-invalid={errorMessages.length > 0 ? 'true' : undefined}
					aria-describedby={errorMessages.length > 0 ? 'texto-errors' : undefined}
					bind:value={submittedText}></textarea>
			</div>
			{#if errorMessages.length > 0}
				<div id="texto-errors" class="help is-danger">
					{#each errorMessages as message (message)}
						<p>{message}</p>
					{/each}
				</div>
			{/if}
		</div>
		<div class="columns">
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<button
					aria-busy={formEnhancer.loading}
					class={[
						'button is-primary is-fullwidth has-text-weight-semibold',
						{ 'is-loading': formEnhancer.loading },
					]}
					disabled={formEnhancer.loading}
					type="submit">Atualizar</button>
			</div>
		</div>
	</div>
</form>

{#if form?.status === 200}
	<Notification class="is-success">Aviso atualizado com sucesso!</Notification>
{/if}
