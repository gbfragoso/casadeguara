<script lang="ts">
	import { enhance } from '$app/forms';
	import Notification from '$lib/components/Notification.svelte';
	import type { ActionData, PageServerData } from './$types';
	interface Props {
		data: PageServerData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	let loading = $state(false);
	let { leitores, exemplares } = $derived(data);

	let leitor = $state('');
	let leitorid = $state(0);

	function selecionarLeitor() {
		const option = document.querySelector<HTMLInputElement>("option[value='" + leitor.toUpperCase() + "']");
		if (option) {
			leitorid = Number(option.getAttribute('data-value') as string);
		}
	}

	let exemplar = $state('');
	let exemplarid = $state(0);

	function selecionarExemplar() {
		const option = document.querySelector<HTMLInputElement>("option[value='" + exemplar.toUpperCase() + "']");
		if (option) {
			exemplarid = Number(option.getAttribute('data-value') as string);
		}
	}
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/biblioteca">Biblioteca</a></li>
			<li class="is-active">
				<a href="/biblioteca/emprestimos" aria-current="page">Empréstimos</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Novo empréstimo</h1>
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
			<div class="column">
				<div class="field">
					<label class="label" for="leitor">Leitor</label>
					<div class="control">
						<input
							class="input"
							type="text"
							name="leitor"
							id="leitor"
							list="leitores"
							autocomplete="off"
							bind:value={leitor}
							onchange={selecionarLeitor}
							required />
						<input type="hidden" name="leitorid" id="leitorid" bind:value={leitorid} />
						<datalist id="leitores">
							{#await leitores then item}
								{#each item as leitor}
									<option data-value={leitor.idleitor} value={leitor.nome}></option>
								{/each}
							{/await}
						</datalist>
					</div>
				</div>
			</div>
			<div class="column">
				<div class="field">
					<label class="label" for="exemplar">Exemplar</label>
					<div class="control">
						<input
							class="input"
							type="text"
							name="exemplar"
							id="exemplar"
							list="exemplares"
							autocomplete="off"
							bind:value={exemplar}
							onchange={selecionarExemplar}
							required />
						<input type="hidden" name="exemplarid" id="exemplarid" bind:value={exemplarid} />
						<datalist id="exemplares">
							{#await exemplares then item}
								{#each item as exemplar}
									<option
										data-value={exemplar.idexemplar}
										value={exemplar.tombo + ' - ' + exemplar.titulo + ' - EX:' + exemplar.numero}
									></option>
								{/each}
							{/await}
						</datalist>
					</div>
				</div>
			</div>
		</div>
		<div class="control mt-3">
			<button
				aria-busy={loading}
				class:is-loading={loading}
				class="button is-primary has-text-weight-semibold"
				type="submit">Cadastrar</button>
		</div>
	</div>
</form>
{#if form?.status === 400}
	<Notification class="is-danger">{form?.message}</Notification>
{/if}
