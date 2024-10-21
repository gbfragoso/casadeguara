<script lang="ts">
	import { enhance } from '$app/forms';
	import Notification from '$lib/components/Notification.svelte';
	import type { ActionData } from './$types';
	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
	let loading = $state(false);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/secretaria">Secretaria</a></li>
			<li class="is-active">
				<a href="/secretaria/leitores" aria-current="page">Trabalhador</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Cadastro de trabalhadores</h1>
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
			<div class="field column is-three-fifths">
				<label class="label" for="nome">Nome</label>
				<div class="control">
					<input class="input" type="text" name="nome" id="nome" />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="rg">RG</label>
				<div class="control">
					<input class="input" type="text" name="rg" id="rg" />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="rg">CPF</label>
				<div class="control">
					<input class="input" type="text" name="cpf" id="cpf" />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="aniversario">Aniversário</label>
				<div class="control">
					<input class="input" type="date" name="aniversario" id="aniversario" aria-label="Date" />
				</div>
			</div>
		</div>
		<div class="columns">
			<div class="field column">
				<label class="label" for="email">E-mail</label>
				<div class="control">
					<input class="input" type="email" name="email" id="email" />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="celular">Celular</label>
				<div class="control">
					<input class="input" type="text" name="celular" id="celular" />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="telefone">Whatsapp</label>
				<div class="control">
					<input class="input" type="text" name="telefone" id="telefone" />
				</div>
			</div>
		</div>
		<div class="columns">
			<div class="field column is-half">
				<label class="label" for="logradouro">Logradouro</label>
				<div class="control">
					<input class="input" type="text" name="logradouro" id="logradouro" />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="bairro">Bairro</label>
				<div class="control">
					<input class="input" type="text" name="bairro" id="bairro" />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="complemento">Complemento</label>
				<div class="control">
					<input class="input" type="text" name="complemento" id="complemento" />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="cidade">Cidade</label>
				<div class="control">
					<input class="input" type="text" name="cidade" id="cidade" />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="cep">CEP</label>
				<div class="control">
					<input class="input" type="text" name="cep" id="cep" />
				</div>
			</div>
		</div>
		<div class="field is-grouped">
			<label for="trab" class="checkbox">
				<input type="checkbox" name="trab" id="trab" checked />
				Trabalhador
			</label>
		</div>
		<div class="control">
			<button
				aria-busy={loading}
				class:is-loading={loading}
				class="button is-primary has-text-weight-semibold"
				type="submit">Cadastrar</button>
		</div>
	</div>
</form>

{#if form?.status === 200}
	<Notification class="is-success">Leitor cadastrado com sucesso!</Notification>
{/if}
