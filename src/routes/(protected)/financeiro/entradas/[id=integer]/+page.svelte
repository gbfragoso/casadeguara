<script lang="ts">
	import { isodate } from '$lib/js/date';
	import type { PageServerData, ActionData } from './$types';

	export let data: PageServerData;
	export let form: ActionData;

	$: ({ entrada } = data);
</script>

<hgroup>
	<h2 class="pico-color-azure-500">Entradas</h2>
	<p>Atualizar os dados da doação</p>
</hgroup>

<form action="?/update" method="POST">
	<div class="flex-container">
		<label>
			Valor
			<input type="number" name="valor" id="valor" value={entrada.valor} />
		</label>
		<label>
			Data do recebimento
			<input type="date" name="data_entrada" value={isodate(entrada.data_entrada)} />
		</label>
	</div>
	<button type="submit" style="width: auto">Atualizar</button>
</form>

{#if form?.status === 200}
	<p>Doação atualizada com sucesso!</p>
{/if}
