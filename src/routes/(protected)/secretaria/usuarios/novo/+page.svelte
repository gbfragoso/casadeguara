<script lang="ts">
	import { enhance } from '$app/forms';
	import Notification from '$lib/components/Notification.svelte';
	import validator from 'validator';
	import type { ActionData } from './$types';
	export let form: ActionData;
	let loading = false;

	let password = '';
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/secretaria">Secretaria</a></li>
			<li class="is-active">
				<a href="/secretaria/usuarios" aria-current="page">Usuários</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Cadastro de usuários</h1>
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
			<label class="label" for="username">Usuário</label>
			<div class="control">
				<input class="input" name="username" id="username" />
			</div>
		</div>
		<div class="field">
			<label class="label" for="password">Senha</label>
			<div class="control">
				<input class="input" type="password" name="password" id="password" bind:value={password} /><br />
			</div>
			<span class="help">
				Força da senha
				<progress
					class="progress is-primary is-small"
					value={validator.isStrongPassword(password, { returnScore: true })}
					max="50"></progress>
			</span>
		</div>
		<div class="field">
			<label class="label" for="name">Nome</label>
			<div class="control">
				<input class="input" name="name" id="name" />
			</div>
		</div>
		<label class="label" for="roles">Setor</label>
		<div class="select mb-4">
			<select name="roles" id="roles">
				<option value="biblioteca">Biblioteca</option>
				<option value="secretaria">Secretaria</option>
				<option value="financeiro">Tesouraria</option>
			</select>
		</div>
		<div class="field">
			<div class="control">
				<button
					aria-busy={loading}
					class:is-loading={loading}
					class="button is-primary has-text-weight-semibold"
					type="submit">Cadastrar</button>
			</div>
		</div>
	</div>
</form>

{#if form?.status === 201}
	<Notification class="is-success">Usuário cadastrado com sucesso!</Notification>
{/if}
