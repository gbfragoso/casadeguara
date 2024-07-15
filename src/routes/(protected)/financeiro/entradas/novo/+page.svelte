<script lang="ts">
	import type { PageServerData, ActionData } from './$types';
	export let data: PageServerData;
	export let form: ActionData;

	$: ({ contribuintes } = data);
</script>

<hgroup>
	<h2 class="pico-color-azure-500">Entradas</h2>
	<p>Lançamento de doações e valores recebidos</p>
</hgroup>

<form method="POST">
	<label
		>Doador
		<input
			type="text"
			name="nome"
			placeholder="Digite o nome do doador"
			list="contribuintes"
			aria-invalid={form?.field === 'nome' ? 'true' : undefined}
			aria-describedby={form?.field === 'nome' ? 'nome-error' : undefined}
		/>
		{#if form?.field === 'nome'}
			<small id="nome-error">{form?.message}</small>
		{/if}
		<datalist id="contribuintes">
			{#await contribuintes then contribuintes}
				{#each contribuintes as contribuinte}
					<option value={contribuinte.nome}></option>
				{/each}
			{/await}
		</datalist>
	</label>
	<label
		>Descrição
		<input
			type="text"
			name="descricao"
			min="1"
			step="any"
			placeholder="Discriminação do valor recebido"
		/>
	</label>
	<div class="flex-container">
		<label
			>Valor
			<input type="number" name="valor" min="1" step="any" placeholder="Digite o valor da doação" />
		</label>
		<label>
			Data do recebimento
			<input type="date" name="data_entrada" aria-label="Date" />
		</label>
	</div>
	<button type="submit">Cadastrar</button>
</form>

{#if form?.status === 201}
	<p>Doação cadastrada com sucesso!</p>
{/if}
