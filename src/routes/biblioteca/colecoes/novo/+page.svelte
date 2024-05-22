<script lang="ts">
	import type { ActionData } from './$types';
	export let form: ActionData;
</script>

<h2>Cadastro de coleções</h2>

<form method="POST">
	<input type="text" name="nome" id="nome" />
	<button>Cadastrar</button>
</form>

{#if form?.status === 201}
	<p>Coleção cadastrada com sucesso!</p>
{/if}
