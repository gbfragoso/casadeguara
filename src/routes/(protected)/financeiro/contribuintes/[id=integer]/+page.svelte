<script lang="ts">
	import { isodate } from '$lib/js/date';
	import type { PageServerData, ActionData } from './$types';

	export let data: PageServerData;
	export let form: ActionData;

	$: ({ contribuinte } = data);
</script>

<hgroup>
	<h2 class="pico-color-azure-500">Contribuinte</h2>
	<p>Atualizar os dados do contribuinte</p>
</hgroup>

<form action="?/update" method="POST">
	<label>
		Nome
		<input type="text" name="nome" id="nome" value={contribuinte.nome} />
	</label>
	<label>
		Trabalhador
		<input type="checkbox" name="trabalhador" checked={contribuinte.trab} />
	</label>
	<button type="submit" style="width: auto">Atualizar</button>
</form>

{#if form?.status === 200}
	<p>Contribuinte atualizado com sucesso!</p>
{/if}
