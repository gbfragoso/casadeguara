<script lang="ts">
	import { enhance } from "$app/forms";
	import type { ActionData } from "./$types";
	export let form: ActionData;
</script>

<div class="card container mt-6 mx-auto">
	<div class="card-header is-primary">
		<p class="card-header-title pl-5 is-size-3 has-text-weight-semibold has-background-primary has-text-warning">Login</p>
	</div>
	<div class="card-content">
		<form method="POST" use:enhance>
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
					<input
						class="input"
						type="password"
						name="password"
						id="password"
					/>
					{#if form?.invalidPassword}
						<p class="help is-danger">Senha inválida</p>
					{/if}
				</div>
			</div>
			<div class="field is-grouped">
				<div class="control">
					<button class="button is-primary is-outlined px-5">Entrar</button>
				</div>
			</div>
			{#if form?.failedLogin}
				<p class="help is-danger">Email ou senha inválida</p>
			{/if}
		</form>
	</div>
</div>
