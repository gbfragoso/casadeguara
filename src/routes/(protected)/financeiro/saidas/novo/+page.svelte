<script lang="ts">
	import type { ActionData } from './$types';
	export let form: ActionData;
</script>

<hgroup>
	<h2 class="pico-color-azure-500">Despesas</h2>
	<p>Lançamento de despesas</p>
</hgroup>

<form method="POST">
	<label
		>Valor
		<input
			type="number"
			name="valor"
			id="valor"
			min="1"
			step="any"
			placeholder="Digite o valor do pagamento"
		/>
	</label>
	<label
		>Descrição
		<input
			type="text"
			name="descricao"
			id="descricao"
			placeholder="Digite a descrição do pagamento"
		/>
	</label>
	<label
		>Data da pagamento
		<input type="date" name="data_despesa" aria-label="Date" />
	</label>
	<button>Cadastrar</button>
</form>

{#if form?.status === 201}
	<p>Pagamento cadastrado com sucesso!</p>
{/if}
