<script lang="ts">
	import { resolve } from '$app/paths';
	import Notification from '$lib/components/Notification.svelte';
	import { createFormEnhancer } from '$lib/js/form-enhancer.svelte';
	import type { ActionData } from './$types';

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let workerChecked = $derived(form?.values?.trab !== 'false');
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a href={resolve('/secretaria')}>Secretaria</a></li>
			<li class="is-active">
				<a href={resolve('/secretaria/cadastros')} aria-current="page">Cadastros</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Cadastro de trabalhadores</h1>
</div>

<form class="card" method="POST" {@attach formEnhancer.attachment}>
	<div class="card-content">
		<div class="columns">
			<div class="field column is-three-fifths">
				<label class="label" for="nome">Nome</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="nome"
						id="nome"
						value={form?.values?.nome ?? ''}
						autocomplete="name"
						maxlength="60"
						required
						aria-describedby={form?.errors?.nome?.length ? 'nome-errors' : undefined}
						aria-invalid={form?.errors?.nome?.length ? 'true' : undefined} />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="rg">RG</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="rg"
						id="rg"
						value={form?.values?.rg ?? ''}
						maxlength="12"
						inputmode="numeric"
						autocomplete="off"
						aria-describedby={form?.errors?.rg?.length ? 'rg-errors' : undefined}
						aria-invalid={form?.errors?.rg?.length ? 'true' : undefined} />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="cpf">CPF</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="cpf"
						id="cpf"
						value={form?.values?.cpf ?? ''}
						maxlength="14"
						inputmode="numeric"
						autocomplete="off"
						aria-describedby={form?.errors?.cpf?.length ? 'cpf-errors' : undefined}
						aria-invalid={form?.errors?.cpf?.length ? 'true' : undefined} />
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
						value={form?.values?.aniversario ?? ''}
						aria-describedby={form?.errors?.aniversario?.length ? 'aniversario-errors' : undefined}
						aria-invalid={form?.errors?.aniversario?.length ? 'true' : undefined} />
				</div>
			</div>
		</div>
		<div class="columns">
			<div class="field column">
				<label class="label" for="email">E-mail</label>
				<div class="control">
					<input
						class="input"
						type="email"
						name="email"
						id="email"
						value={form?.values?.email ?? ''}
						maxlength="60"
						autocomplete="email"
						aria-describedby={form?.errors?.email?.length ? 'email-errors' : undefined}
						aria-invalid={form?.errors?.email?.length ? 'true' : undefined} />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="celular">Celular</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="celular"
						id="celular"
						value={form?.values?.celular ?? ''}
						maxlength="15"
						inputmode="tel"
						autocomplete="tel-national"
						aria-describedby={form?.errors?.celular?.length ? 'celular-errors' : undefined}
						aria-invalid={form?.errors?.celular?.length ? 'true' : undefined} />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="telefone">WhatsApp</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="telefone"
						id="telefone"
						value={form?.values?.telefone ?? ''}
						maxlength="15"
						inputmode="tel"
						autocomplete="tel-national"
						aria-describedby={form?.errors?.telefone?.length ? 'telefone-errors' : undefined}
						aria-invalid={form?.errors?.telefone?.length ? 'true' : undefined} />
				</div>
			</div>
		</div>
		<div class="columns">
			<div class="field column is-half">
				<label class="label" for="logradouro">Logradouro</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="logradouro"
						id="logradouro"
						value={form?.values?.logradouro ?? ''}
						maxlength="80"
						autocomplete="street-address"
						aria-describedby={form?.errors?.logradouro?.length ? 'logradouro-errors' : undefined}
						aria-invalid={form?.errors?.logradouro?.length ? 'true' : undefined} />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="bairro">Bairro</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="bairro"
						id="bairro"
						value={form?.values?.bairro ?? ''}
						maxlength="30"
						autocomplete="address-level3"
						aria-describedby={form?.errors?.bairro?.length ? 'bairro-errors' : undefined}
						aria-invalid={form?.errors?.bairro?.length ? 'true' : undefined} />
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
						value={form?.values?.complemento ?? ''}
						maxlength="100"
						autocomplete="address-line2"
						aria-describedby={form?.errors?.complemento?.length ? 'complemento-errors' : undefined}
						aria-invalid={form?.errors?.complemento?.length ? 'true' : undefined} />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="cidade">Cidade</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="cidade"
						id="cidade"
						value={form?.values?.cidade ?? ''}
						maxlength="100"
						autocomplete="address-level2"
						aria-describedby={form?.errors?.cidade?.length ? 'cidade-errors' : undefined}
						aria-invalid={form?.errors?.cidade?.length ? 'true' : undefined} />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="cep">CEP</label>
				<div class="control">
					<input
						class="input"
						type="text"
						name="cep"
						id="cep"
						value={form?.values?.cep ?? ''}
						maxlength="9"
						inputmode="numeric"
						autocomplete="postal-code"
						aria-describedby={form?.errors?.cep?.length ? 'cep-errors' : undefined}
						aria-invalid={form?.errors?.cep?.length ? 'true' : undefined} />
				</div>
			</div>
		</div>
		<div class="field is-grouped">
			<input type="hidden" name="trab" value="false" />
			<label for="trab" class="checkbox">
				<input
					type="checkbox"
					name="trab"
					id="trab"
					value="true"
					checked={workerChecked}
					aria-describedby={form?.errors?.trab?.length ? 'trab-errors' : undefined}
					aria-invalid={form?.errors?.trab?.length ? 'true' : undefined} />
				Trabalhador
			</label>
		</div>
		{#if form?.errors}
			<div class="notification is-danger" aria-live="polite">
				{#each Object.entries(form.errors) as [field, messages] (field)}
					<div id={`${field}-errors`}>
						{#each messages as message (`${field}-${message}`)}
							<p>{message}</p>
						{/each}
					</div>
				{/each}
			</div>
		{/if}
		<div class="control">
			<button
				aria-busy={formEnhancer.loading}
				class={['button is-primary has-text-weight-semibold', { 'is-loading': formEnhancer.loading }]}
				type="submit">Cadastrar</button>
		</div>
	</div>
</form>

{#if form?.status === 201}
	<Notification class="is-success">Trabalhador cadastrado com sucesso!</Notification>
{/if}
