<script lang="ts">
	import Notification from '$lib/components/Notification.svelte';
	import type { ActionData, PageServerData } from './$types';
	export let data: PageServerData;
	export let form: ActionData;

	$: ({ aviso } = data);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/biblioteca">Biblioteca</a></li>
			<li class="is-active">
				<a href="/biblioteca/aviss" aria-current="page">Avisos</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Atualizar aviso</h1>
</div>

<form class="card" method="POST">
	<div class="card-content">
		<div class="field">
			<label class="label" for="texto">Texto do aviso</label>
			<div class="control">
				<textarea
					class="textarea has-fixed-size"
					name="texto"
					id="texto"
					value={aviso.texto}
					placeholder="Digite o texto do aviso"
					required />
			</div>
			{#if form?.field === 'texto'}
				<p class="help is-danger">{form?.message}</p>
			{/if}
		</div>
		<div class="control">
			<button class="button is-primary has-text-weight-semibold" type="submit">Atualizar</button>
		</div>
	</div>
</form>

{#if form?.status === 200}
	<Notification class="is-success">Aviso atualizado com sucesso!</Notification>
{/if}
