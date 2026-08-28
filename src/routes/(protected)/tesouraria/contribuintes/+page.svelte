<script lang="ts">
	import { resolve } from '$app/paths';
	import { createFormEnhancer } from '$lib/forms/enhancer.svelte';
	import type { ActionData } from './$types';

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let contribuintes = $derived(form?.contribuintes);
	let searchName = $derived(form?.values?.nome ?? '');
</script>

<div class="mb-2">
	<nav id="breadcrumb" class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href={resolve('/tesouraria')}>Tesouraria</a></li>
			<li class="is-active">
				<a href={resolve('/tesouraria/contribuintes')} aria-current="page">Contribuintes</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Contribuintes</h1>
</div>

<form class="card" method="POST" {@attach formEnhancer.submitWithLoading}>
	<div class="card-content">
		<div class="field">
			<label class="label" for="nome">Nome do contribuinte</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="nome"
					id="nome"
					bind:value={searchName}
					placeholder="Digite o nome do contribuinte"
					autocomplete="name"
					maxlength="60"
					aria-describedby={form?.errors?.nome?.length ? 'nome-errors' : undefined}
					aria-invalid={form?.errors?.nome?.length ? 'true' : undefined} />
			</div>
			{#if form?.errors?.nome?.length}
				<div id="nome-errors" class="help is-danger">
					{#each form.errors.nome as message (message)}
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
					type="submit">
					<i class="fa-solid fa-magnifying-glass fa-fw">&nbsp;</i>Pesquisar
				</button>
			</div>
			<div class="column is-full-mobile is-2-tablet" style="min-width: 200px">
				<a
					class="button is-fullwidth has-text-weight-semibold is-warning"
					href={resolve('/tesouraria/contribuintes/novo')}
					><i class="fa-solid fa-plus fa-fw">&nbsp;</i>Novo</a>
			</div>
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
	</div>
</form>

{#if contribuintes !== undefined}
	<div class="card mt-4">
		<div class="card-content">
			{#if contribuintes.length === 0}
				<p>Nenhum contribuinte encontrado.</p>
			{:else}
				<div class="table-container">
					<table class="table is-striped is-hoverable is-fullwidth">
						<thead>
							<tr>
								<th>Contribuinte</th>
								<th>Telefone</th>
								<th>Tipo</th>
							</tr>
						</thead>
						<tbody>
							{#each contribuintes as contribuinte (contribuinte.idleitor)}
								<tr>
									<td>{contribuinte.nome}</td>
									<td>{contribuinte.telefone ?? 'Não informado.'}</td>
									<td>{contribuinte.trab ? 'Trabalhador' : 'Eventual'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</div>
{/if}
