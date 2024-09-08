<script lang="ts">
	import Notification from '$lib/components/Notification.svelte';
	import type { ActionData } from './$types';
	export let form: ActionData;
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/financeiro">Financeiro</a></li>
			<li class="is-active">
				<a href="/financeiro/contribuintes" aria-current="page">Contribuintes</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Cadastrar novo contribuinte</h1>
</div>

<form class="card" method="POST">
	<div class="card-content">
		<div class="field">
			<label class="label" for="nome">Nome</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="nome"
					id="nome"
					placeholder="Digite o nome do contribuinte"
					aria-invalid={form?.field === 'nome' ? 'true' : undefined} />
				{#if form?.field === 'nome'}
					<p class="help is-danger">{form?.message}</p>
				{/if}
			</div>
		</div>
		<div class="field">
			<label class="checkbox" for="trabalhador">
				<input type="checkbox" name="trabalhador" id="trabalhador" />
				Trabalhador</label>
		</div>
		<div class="field">
			<div class="control">
				<button class="button is-primary has-text-weight-semibold" type="submit">Cadastrar</button>
			</div>
		</div>
	</div>
</form>

{#if form?.status === 201}
	<Notification class="is-success">Contribuinte cadastrado com sucesso!</Notification>
{/if}
