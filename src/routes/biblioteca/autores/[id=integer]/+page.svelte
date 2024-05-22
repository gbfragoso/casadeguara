<script lang="ts">
	import type { PageServerData, ActionData } from './$types';
	export let data: PageServerData;
	export let form: ActionData;

	$: ({ autor } = data);
</script>

<h2>Atualizar autor</h2>

<form action="?/update" method="POST">
	<input type="text" name="nome" id="nome" value={autor.nome} />
	<button>Atualizar</button>
</form>

{#if form?.status === 200}
	<p>Autor atualizado com sucesso!</p>
{/if}
