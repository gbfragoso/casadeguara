<script lang="ts">
	import type { ActionData } from './$types';
	export let form: ActionData;
</script>

<hgroup>
	<h2>Entradas</h2>
	<p>Lançamento de doações e valores recebidos</p>
</hgroup>

<form method="POST">
    <label for="nome">Doador</label>
	<input type="text" name="nome" id="nome" placeholder="Digite o nome do doador" />
    <label for="nome">Valor</label>
    <input type="number" name="valor" id="valor" min="1" step="any" placeholder="Digite o valor da doação"/>
    <label for="nome">Data da doação</label>
    <input type="date" name="data_entrada" aria-label="Date" />
	<button>Cadastrar</button>
</form>

{#if form?.status === 201}
	<p>Doação cadastrada com sucesso!</p>
{/if}
