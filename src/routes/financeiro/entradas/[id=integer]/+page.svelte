<script lang="ts">
    import type { PageServerData, ActionData } from "./$types";
    export let data: PageServerData;
    export let form: ActionData;

    $: ({entrada} = data);
</script>

<hgroup>
<h2>Entradas</h2>
<p>Atualizar os dados da doação</p>
</hgroup>

<form action="?/update" method="POST">
    <input type="number" name="valor" id="valor" value={entrada.valor}>
    <input type="date" name="data_entrada" aria-label="Date" value={entrada.data_entrada}/>
    <button>Atualizar</button>
</form>

{#if form?.status === 200}
	<p>Doação atualizada com sucesso!</p>
{/if}