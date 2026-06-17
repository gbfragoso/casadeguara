<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
	let loading = $state(false);
</script>

<main>
	<section class="section">
		<div class="container card mt-6" style="max-width:400px">
			<div class="card-content">
				<div class="is-primary">
					<div class="pb-3 has-text-centered">
						<img src="/logo.png" alt="Avatar" style="width:40%;height:auto" />
					</div>
				</div>
				<form
					method="POST"
					use:enhance={() => {
						loading = true;
						return async ({ update }) => {
							await update();
							loading = false;
						};
					}}>
					<div class="field">
						<label class="label" for="email">Email</label>
						<div class="control">
							<input class="input" type="email" name="email" id="email" />
							{#if form?.invalidEmail}
								<p class="help is-danger">E-mail inválido</p>
							{/if}
						</div>
					</div>
					<div class="field">
						<label class="label" for="password">Senha</label>
						<div class="control">
							<input class="input" type="password" name="password" id="password" />
							{#if form?.invalidPassword}
								<p class="help is-danger">Senha inválida</p>
							{/if}
						</div>
					</div>
					<div class="field pt-3">
						<div class="control">
							<button
								aria-busy={loading}
								class:is-loading={loading}
								class="button is-primary is-fullwidth has-text-weight-semibold">Entrar</button>
						</div>
					</div>
					{#if form?.failedLogin}
						<p class="help is-danger">Email ou senha inválidos</p>
					{/if}
					{#if form?.message}
						<p class="help is-danger">{form.message}</p>
					{/if}
				</form>
			</div>
		</div>
	</section>
</main>
