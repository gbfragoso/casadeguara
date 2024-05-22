<script lang="ts">
	import type { ActionData } from './$types';
	export let form: ActionData;
</script>

<h2>Cadastro de autores</h2>

<form method="POST" role="group">
	<input type="text" name="nome" id="nome" placeholder="Digite o nome do autor" />
	<button>Cadastrar</button>
</form>

{#if form?.status === 201}
	<p>Autor cadastrado com sucesso!</p>
{/if}
