<script lang="ts">
	import { enhance } from '$app/forms';
	import Notification from '$lib/components/Notification.svelte';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import type { ActionData, PageServerData } from './$types';
	interface Props {
		data: PageServerData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	let loading = $state(false);
	let { trabalhador } = $derived(data);
	dayjs.extend(utc);
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href="/secretaria">Secretaria</a></li>
			<li class="is-active">
				<a href="/secretaria/cadastros" aria-current="page">Trabalhadores</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Atualizar dados do trabalhador</h1>
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
					<input class="input" type="text" name="nome" id="nome" value={trabalhador.nome} />
				</div>
				{#if form?.field === 'nome'}
					<p class="help is-danger">{form?.message}</p>
				{/if}
			</div>
			<div class="field column">
				<label class="label" for="rg">RG</label>
				<div class="control">
					<input class="input" type="text" name="rg" id="rg" value={trabalhador.rg} />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="rg">CPF</label>
				<div class="control">
					<input class="input" type="text" name="cpf" id="cpf" value={trabalhador.cpf} />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="aniversario">Aniversário</label>
				<div class="control">
					<input
						class="input"
						type="date"
						name="aniversario"
						id="aniversario"
						aria-label="Date"
						value={dayjs.utc(trabalhador.aniversario).format('YYYY-MM-DD')} />
				</div>
			</div>
		</div>
		<div class="columns">
			<div class="field column">
				<label class="label" for="email">E-mail</label>
				<div class="control">
					<input class="input" type="email" name="email" id="email" value={trabalhador.email} />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="celular">Celular</label>
				<div class="control">
					<input class="input" type="text" name="celular" id="celular" value={trabalhador.celular} />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="telefone">Whatsapp</label>
				<div class="control">
					<input class="input" type="text" name="telefone" id="telefone" value={trabalhador.telefone} />
				</div>
			</div>
		</div>
		<div class="columns">
			<div class="field column is-half">
				<label class="label" for="logradouro">Logradouro</label>
				<div class="control">
					<input class="input" type="text" name="logradouro" id="logradouro" value={trabalhador.logradouro} />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="bairro">Bairro</label>
				<div class="control">
					<input class="input" type="text" name="bairro" id="bairro" value={trabalhador.bairro} />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="complemento">Complemento</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="complemento"
						id="complemento"
						value={trabalhador.complemento} />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="cidade">Cidade</label>
				<div class="control">
					<input class="input" type="text" name="cidade" id="cidade" value={trabalhador.cidade} />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="cep">CEP</label>
				<div class="control">
					<input class="input" type="text" name="cep" id="cep" value={trabalhador.cep} />
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
				type="submit">Atualizar</button>
		</div>
	</div>
</form>

{#if form?.status === 200}
	<Notification class="is-success">Trabalhador atualizado com sucesso!</Notification>
{/if}
