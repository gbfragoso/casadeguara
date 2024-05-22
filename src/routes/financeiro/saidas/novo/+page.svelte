<script lang="ts">
	import type { ActionData } from './$types';
	export let form: ActionData;
</script>

<hgroup>
	<h2>Despesas</h2>
	<p>Lançamento de despesas</p>
</hgroup>

<form method="POST">
	<label for="nome">Valor</label>
	<input
		type="number"
		name="valor"
		id="valor"
		min="1"
		step="any"
		placeholder="Digite o valor do pagamento"
	/>
	<label for="nome">Descrição</label>
	<input
		type="text"
		name="categoria"
		id="categoria"
		placeholder="Digite a descrição do pagamento"
	/>
	<label for="nome">Data da pagamento</label>
	<input type="date" name="data_despesa" aria-label="Date" />
	<button>Cadastrar</button>
</form>

{#if form?.status === 201}
	<p>Pagamento cadastrado com sucesso!</p>
{/if}
