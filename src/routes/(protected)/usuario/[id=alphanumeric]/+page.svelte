<script lang="ts">
	import { createFormEnhancer } from '$lib/forms/enhancer.svelte';
	import Notification from '$lib/components/feedback/Notification.svelte';
	import type { ActionData, PageServerData } from './$types';
	interface Props {
		data: PageServerData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let { usuario } = $derived(data);
</script>

<section class="p-6">
	<div class="mb-2">
		<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Meu cadastro</h1>
	</div>

	<form class="card" method="POST" {@attach formEnhancer.submitWithLoading}>
		<div class="card-content">
			<div class="field">
				<label class="label" for="name">Nome</label>
				<div class="control">
					<input class="input" name="name" id="name" value={usuario.name} />
				</div>
			</div>
			<div class="field">
				<label class="label" for="password">Nova senha</label>
				<div class="control">
					<input class="input" type="password" name="password" id="password" />
				</div>
			</div>
			<div class="field">
				<div class="control">
					<button
						aria-busy={formEnhancer.loading}
						class={['button is-primary has-text-weight-semibold', formEnhancer.loading && 'is-loading']}
						type="submit">Atualizar</button>
				</div>
			</div>
		</div>
	</form>

	{#if form?.status === 200}
		<Notification class="is-success">Usuário atualizado com sucesso!</Notification>
	{/if}
	{#if form?.status === 400 && form?.message}
		<Notification class="is-danger">{form.message}</Notification>
	{/if}
</section>
