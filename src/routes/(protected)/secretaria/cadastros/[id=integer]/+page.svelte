<script lang="ts">
	import { resolve } from '$app/paths';
	import Notification from '$lib/components/Notification.svelte';
	import { createFormEnhancer } from '$lib/js/form-enhancer.svelte';
	import type { ActionData, PageServerData } from './$types';

	interface Props {
		data: PageServerData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	const formEnhancer = createFormEnhancer();
	let trabalhador = $derived(data.trabalhador);
	let workerChecked = $derived(
		form?.values?.trab === 'true' || (form?.values?.trab === undefined && trabalhador.trab),
	);
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
	<h1 class="is-size-3 has-text-weight-semibold has-text-primary">Atualizar dados do trabalhador</h1>
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
						value={form?.values?.nome ?? trabalhador.nome}
						autocomplete="name"
						maxlength="60"
						required
						aria-describedby={form?.errors?.nome?.length ? 'nome-errors' : undefined}
						aria-invalid={form?.errors?.nome?.length ? 'true' : undefined} />
				</div>
			</div>
			<div class="field column">
				<label class="label" for="rg">Novo RG</label>
				<p class="help">RG cadastrado: {trabalhador.rgMask ?? 'Não informado.'}</p>
				<div class="control">
					<input
						class="input"
						type="text"
						name="rg"
						id="rg"
						value=""
						maxlength="12"
						inputmode="numeric"
						autocomplete="off"
						aria-describedby={form?.errors?.rg?.length ? 'rg-errors' : undefined}
						aria-invalid={form?.errors?.rg?.length ? 'true' : undefined} />
				</div>
				<label for="removeRg" class="checkbox mt-2">
					<input
						type="checkbox"
						name="removeRg"
						id="removeRg"
						value="true"
						checked={form?.values?.removeRg === 'true'}
						aria-describedby={form?.errors?.removeRg?.length ? 'removeRg-errors' : undefined}
						aria-invalid={form?.errors?.removeRg?.length ? 'true' : undefined} />
					Remover RG cadastrado
				</label>
			</div>
			<div class="field column">
				<label class="label" for="cpf">Novo CPF</label>
				<p class="help">CPF cadastrado: {trabalhador.cpfMask ?? 'Não informado.'}</p>
				<div class="control">
					<input
						class="input"
						type="text"
						name="cpf"
						id="cpf"
						value=""
						maxlength="14"
						inputmode="numeric"
						autocomplete="off"
						aria-describedby={form?.errors?.cpf?.length ? 'cpf-errors' : undefined}
						aria-invalid={form?.errors?.cpf?.length ? 'true' : undefined} />
				</div>
				<label for="removeCpf" class="checkbox mt-2">
					<input
						type="checkbox"
						name="removeCpf"
						id="removeCpf"
						value="true"
						checked={form?.values?.removeCpf === 'true'}
						aria-describedby={form?.errors?.removeCpf?.length ? 'removeCpf-errors' : undefined}
						aria-invalid={form?.errors?.removeCpf?.length ? 'true' : undefined} />
					Remover CPF cadastrado
				</label>
			</div>
			<div class="field column">
				<label class="label" for="aniversario">Aniversário</label>
				<div class="control">
					<input
						class="input"
						type="date"
						name="aniversario"
						id="aniversario"
						value={form?.values?.aniversario ?? trabalhador.aniversario ?? ''}
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
						value={form?.values?.email ?? trabalhador.email ?? ''}
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
						value={form?.values?.celular ?? trabalhador.celular ?? ''}
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
						value={form?.values?.telefone ?? trabalhador.telefone ?? ''}
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
						value={form?.values?.logradouro ?? trabalhador.logradouro ?? ''}
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
						value={form?.values?.bairro ?? trabalhador.bairro ?? ''}
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
						value={form?.values?.complemento ?? trabalhador.complemento ?? ''}
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
						value={form?.values?.cidade ?? trabalhador.cidade ?? ''}
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
						value={form?.values?.cep ?? trabalhador.cep ?? ''}
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
				type="submit">Atualizar</button>
		</div>
	</div>
</form>

{#if form?.status === 200}
	<Notification class="is-success">Trabalhador atualizado com sucesso!</Notification>
{/if}
