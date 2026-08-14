<script lang="ts">
	import { resolve } from '$app/paths';
	import Notification from '$lib/components/Notification.svelte';
	import { createFormEnhancer } from '$lib/js/form-enhancer.svelte';
	import type { ActionData, PageServerData } from './$types';

	interface Props {
		data: PageServerData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let contribuinte = $derived(data.contribuinte);
	let workerChecked = $derived(
		form?.values?.trab === 'true' || (form?.values?.trab === undefined && contribuinte.trab),
	);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href={resolve('/tesouraria')}>Tesouraria</a></li>
			<li class="is-active">
				<a href={resolve('/tesouraria/contribuintes')} aria-current="page">Contribuintes</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Atualizar informações do contribuinte</h1>
</div>

<form class="card" method="POST" {@attach formEnhancer.attachment}>
	<div class="card-content">
		<div class="field">
			<label class="label" for="nome">Nome</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="nome"
					id="nome"
					value={form?.values?.nome ?? contribuinte.nome}
					autocomplete="name"
					maxlength="60"
					required
					aria-describedby={form?.errors?.nome?.length ? 'nome-errors' : undefined}
					aria-invalid={form?.errors?.nome?.length ? 'true' : undefined} />
			</div>
		</div>
		<div class="field">
			<label class="label" for="telefone">WhatsApp (com DDD)</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="telefone"
					id="telefone"
					value={form?.values?.telefone ?? contribuinte.telefone ?? ''}
					maxlength="15"
					inputmode="tel"
					autocomplete="tel-national"
					aria-describedby={form?.errors?.telefone?.length ? 'telefone-errors' : undefined}
					aria-invalid={form?.errors?.telefone?.length ? 'true' : undefined} />
			</div>
		</div>
		<div class="field">
			<input type="hidden" name="trab" value="false" />
			<label for="trab" class="checkbox">
				<input
					type="checkbox"
					name="trab"
					id="trab"
					value="true"
					checked={workerChecked}
					aria-describedby={form?.errors?.trab?.length ? 'trab-errors' : undefined}
					aria-invalid={form?.errors?.trab?.length ? 'true' : undefined} />
				Trabalhador
			</label>
		</div>
		{#if form?.errors}
			<div class="notification is-danger" aria-live="polite">
				{#each Object.entries(form.errors) as [field, messages] (field)}
					<div id={`${field}-errors`}>
						{#each messages as message (`${field}-${message}`)}
							<p>{message}</p>
						{/each}
					</div>
				{/each}
			</div>
		{/if}
		<div class="control">
			<button
				aria-busy={formEnhancer.loading}
				class={['button is-primary has-text-weight-semibold', { 'is-loading': formEnhancer.loading }]}
				type="submit">Atualizar</button>
		</div>
	</div>
</form>

{#if form?.status === 200}
	<Notification class="is-success">Contribuinte atualizado com sucesso!</Notification>
{/if}
