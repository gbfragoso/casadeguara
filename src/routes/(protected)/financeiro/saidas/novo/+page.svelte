<script lang="ts">
	import type { ActionData } from "./$types";
	export let form: ActionData;
</script>

<div class="mb-2">
	<nav class="breadcrumb m-0" aria-label="breadcrumbs">
		<ul>
			<li><a data-sveltekit-reload href="/financeiro">Financeiro</a></li>
			<li class="is-active">
				<a data-sveltekit-reload href="/financeiro/saidas" aria-current="page">saidas</a>
			</li>
		</ul>
	</nav>
	<h1 class="is-size-3 has-text-weight-semibold is-primary">
		Lançamento de despesas
	</h1>
</div>

<form class="card" method="POST">
	<div class="card-content">
		<div class="field">
			<label class="label" for="descricao">Descrição</label>
			<div class="control">
				<input
					class="input"
					type="text"
					name="descricao"
					min="1"
					step="any"
					placeholder="Discriminação da despesa"
					required
				/>
				{#if form?.field === "descricao"}
					<p class="help is-danger">{form?.message}</p>
				{/if}
			</div>
		</div>
		<div class="columns">
			<div class="field column">
				<label class="label" for="valor">Valor</label>
				<div class="control">
					<input
						class="input"
						type="number"
						name="valor"
						min="1"
						step="any"
						placeholder="Digite o valor do pagamento"
						required
					/>
				</div>
			</div>
			<div class="field column">
				<label class="label" for="data_saida">
					Data do pagamento</label
				>
				<div class="control">
					<input
						class="input"
						type="date"
						name="data_saida"
						aria-label="Date"
						required
					/>
				</div>
			</div>
		</div>
		<div class="field">
			<div class="control">
				<button class="button is-primary px-5" type="submit"
					>Cadastrar</button
				>
			</div>
		</div>
	</div>
</form>

{#if form?.status === 201}
	<div class="notification is-success">
		<p>Despesa cadastrada com sucesso!</p>
	</div>
{/if}
