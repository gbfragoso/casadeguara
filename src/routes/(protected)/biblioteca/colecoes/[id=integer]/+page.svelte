<script lang="ts">
	import type { PageServerData, ActionData } from './$types';
	export let data: PageServerData;
	export let form: ActionData;

	$: ({ colecao } = data);
</script>

<h2>Atualizar coleção</h2>

<form action="?/update" method="POST">
	<input type="text" name="nome" id="nome" value={colecao.nome} />
	<button>Atualizar</button>
</form>

{#if form?.status === 200}
	<p>Coleção atualizada com sucesso!</p>
{/if}
