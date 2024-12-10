<script lang="ts">
	import { enhance } from '$app/forms';
	import dayjs from 'dayjs';
	import Notification from '$lib/components/Notification.svelte';
	import utc from 'dayjs/plugin/utc';
	import type { ActionData, PageServerData } from './$types';
	interface Props {
		data: PageServerData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	let loading = $state(false);
	let { emprestimo, exemplares } = $derived(data);
	dayjs.extend(utc);
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
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Atualizar empréstimo</h1>
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
		<div class="field">
			<label class="label" for="nome">Leitor</label>
			<div class="control">
				<input class="input" type="text" name="leitor" id="leitor" value={emprestimo.leitor} disabled />
			</div>
		</div>
		<div class="field">
			<label class="label" for="nome">Exemplar atual</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="exemplaratual"
					id="exemplaratual"
					value={emprestimo.livro + ' - EX:' + emprestimo.numero}
					disabled />
				<input type="hidden" name="idexemplar" id="idexemplar" value={emprestimo.idexemplar} />
			</div>
		</div>
		<div class="field">
			<label class="label" for="nome">Exemplar</label>
			<div class="select is-fullwidth">
				<select name="novoexemplar" id="novoexemplar" required>
					<option value=""></option>
					{#await exemplares then item}
						{#each item as exemplar}
							<option value={exemplar.idexemplar}>{exemplar.livro + ' - EX:' + exemplar.numero}</option>
						{/each}
					{/await}
				</select>
			</div>
		</div>
		<p class="mb-2 has-text-centered">
			Emprestado por <strong>{emprestimo.usuarioEmprestimo}</strong> no dia {dayjs
				.utc(emprestimo.dataEmprestimo)
				.format('DD/MM/YYYY')}
		</p>
		<div class="control">
			<button
				aria-busy={loading}
				class:is-loading={loading}
				class="button is-primary has-text-weight-semibold"
				type="submit">Atualizar</button>
		</div>
	</div>
</form>

{#if form?.status === 200}
	<Notification class="is-success">Empréstimo atualizado com sucesso</Notification>
{/if}
