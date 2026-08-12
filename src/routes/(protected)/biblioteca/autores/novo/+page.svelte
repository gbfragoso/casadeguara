<script lang="ts">
	import { enhance } from '$app/forms';
	import Notification from '$lib/components/Notification.svelte';
	import { fromAction } from 'svelte/attachments';
	import type { ActionData, SubmitFunction } from './$types';

	interface Props {
		form: ActionData | null | undefined;
	}

	let { form }: Props = $props();
	let loading = $state(false);
	let errors = $derived(form?.errors?.nome ?? []);

	function submit(): SubmitFunction {
		return () => {
			loading = true;
			return async ({ update }) => {
				try {
					await update();
				} finally {
					loading = false;
				}
			};
		};
	}

	function enhanceForm(form: HTMLFormElement, callback: SubmitFunction) {
		return enhance(form, callback);
	}
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/biblioteca">Biblioteca</a></li>
			<li class="is-active"><a href="/biblioteca/autores" aria-current="page">Autores</a></li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Cadastro de autores</h1>
</div>

<form class="card" method="POST" {@attach fromAction(enhanceForm, submit)}>
	<div class="card-content">
		<div class="field">
			<label class="label" for="nome">Nome do autor</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="nome"
					id="nome"
					value={form?.values?.nome ?? ''}
					placeholder="Digite o nome do autor"
					maxlength="60"
					required
					aria-invalid={errors.length > 0}
					aria-describedby={errors.length > 0 ? 'nome-errors' : undefined} />
			</div>
			{#if errors.length > 0}<div id="nome-errors" class="help is-danger">
					{#each errors as message (message)}<p>{message}</p>{/each}
				</div>{/if}
		</div>
		<div class="control">
			<button
				aria-busy={loading}
				class={['button is-primary has-text-weight-semibold', { 'is-loading': loading }]}
				type="submit">Cadastrar</button>
		</div>
	</div>
</form>

{#if form?.status === 201}<Notification class="is-success">Autor cadastrado com sucesso!</Notification>{/if}
