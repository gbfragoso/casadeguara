<script lang="ts">
	import { isodate } from '$lib/js/date';
	import type { PageServerData, ActionData } from './$types';

	export let data: PageServerData;
	export let form: ActionData;

	$: ({ saida } = data);
</script>

<hgroup>
	<h2>Entradas</h2>
	<p>Atualizar os dados da doação</p>
</hgroup>

<form action="?/update" method="POST">
	<label>
		Valor
		<input type="number" name="valor" id="valor" value={saida.valor} />
	</label>
	<label>
		Descrição
		<input type="text" name="descricao" id="descricao" value={saida.descricao} />
	</label>
	<label>
		Data do pagamento
		<input type="date" name="data_saida" aria-label="Date" value={isodate(saida.data_saida)} />
	</label>
	<button>Atualizar</button>
</form>

{#if form?.status === 200}
	<p>Doação atualizada com sucesso!</p>
{/if}
