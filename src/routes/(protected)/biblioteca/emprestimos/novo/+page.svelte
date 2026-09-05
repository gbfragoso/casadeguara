<script lang="ts">
	import { resolve } from '$app/paths';
	import Autocomplete from '$lib/components/forms/Autocomplete.svelte';
	import Notification from '$lib/components/feedback/Notification.svelte';
	import { createFormEnhancer } from '$lib/forms/enhancer.svelte';
	import type { ActionData, PageServerData } from './$types';
	interface Props {
		data: PageServerData;
		form?: ActionData;
	}

	let { data, form }: Props = $props();
	let { leitores, exemplares } = $derived(data);
	let readerId = $state('');
	let copyId = $state('');
	const formEnhancer = createFormEnhancer();
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href={resolve('/biblioteca')}>Biblioteca</a></li>
			<li><a href={resolve('/biblioteca/emprestimos')} aria-current="page">Empréstimos</a></li>
			<li class="is-active">
				<a href={resolve('/biblioteca/emprestimos/novo')} aria-current="page">Novo</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Novo empréstimo</h1>
</div>

<form class="card" method="POST" {@attach formEnhancer.submitWithLoading}>
	<div class="card-content">
		<div class="columns">
			<div class="column">
				<div class="field">
					<label class="label" for="leitor">Leitor</label>
					{#await leitores}
						<p class="help" role="status">Carregando leitores...</p>
					{:then items}
						<Autocomplete
							id="leitor"
							name="leitorid"
							options={items.map(({ idleitor, nome }) => ({ value: String(idleitor), label: nome }))}
							bind:value={readerId}
							placeholder="Pesquise e selecione um leitor"
							optionLabel="Leitor"
							listLabel="Leitores sugeridos"
							emptyMessage="Nenhum leitor encontrado."
							selectionMessage="Selecione um leitor da lista."
							invalid={form?.field === 'leitor' ? 'true' : undefined}
							describedBy={form?.field === 'leitor' ? 'emprestimo-errors' : undefined}
							required />
					{:catch}
						<p class="help is-danger" role="alert">Não foi possível carregar os leitores.</p>
					{/await}
				</div>
			</div>
			<div class="column">
				<div class="field">
					<label class="label" for="exemplar">Exemplar</label>
					{#await exemplares}
						<p class="help" role="status">Carregando exemplares...</p>
					{:then items}
						<Autocomplete
							id="exemplar"
							name="exemplarid"
							options={items.map(({ idexemplar, tombo, titulo, numero }) => ({
								value: String(idexemplar),
								label: `${tombo} - ${titulo} - EX:${numero}`,
							}))}
							bind:value={copyId}
							placeholder="Pesquise pelo título, tombo ou número do exemplar"
							optionLabel="Exemplar"
							listLabel="Exemplares sugeridos"
							emptyMessage="Nenhum exemplar encontrado."
							selectionMessage="Selecione um exemplar da lista."
							invalid={form?.field === 'exemplar' ? 'true' : undefined}
							describedBy={form?.field === 'exemplar' ? 'emprestimo-errors' : undefined}
							required />
					{:catch}
						<p class="help is-danger" role="alert">Não foi possível carregar os exemplares.</p>
					{/await}
				</div>
			</div>
		</div>
		<div class="control mt-3">
			<button
				aria-busy={formEnhancer.loading}
				disabled={!readerId || !copyId || formEnhancer.loading}
				class={['button is-primary has-text-weight-semibold', { 'is-loading': formEnhancer.loading }]}
				type="submit">Cadastrar</button>
		</div>
	</div>
</form>
{#if form?.status === 400}
	<div id="emprestimo-errors"><Notification class="is-danger">{form.message}</Notification></div>
{/if}
