<script lang="ts">
	import { enhance } from '$app/forms';
	import Notification from '$lib/components/Notification.svelte';
	import type { ActionData, PageServerData } from './$types';
	export let data: PageServerData;
	export let form: ActionData;
	let loading = false;

	$: ({ leitores, exemplares } = data);
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
				<label class="label" for="leitor">Leitor</label>
				<div class="select is-fullwidth">
					<select name="leitor" id="leitor" required>
						<option>Selecione um leitor</option>
						{#await leitores then item}
							{#each item as leitor}
								<option value={leitor.idleitor}>{leitor.nome}</option>
							{/each}
						{/await}
					</select>
				</div>
			</div>
			<div class="column">
				<label class="label" for="exemplar">Exemplar</label>
				<div class="select is-fullwidth">
					<select name="exemplar" id="exemplar" required>
						<option>Selecione o exemplar</option>
						{#await exemplares then item}
							{#each item as exemplar}
								<option value={exemplar.idexemplar}
									>{exemplar.tombo} - {exemplar.titulo} - Ex: {exemplar.numero}</option>
							{/each}
						{/await}
					</select>
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
