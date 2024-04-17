<script lang="ts">
    import type { PageServerData } from "./$types";
    export let data: PageServerData;
</script>

<div>Consulta editoras</div>

<table>
    <thead>
        <th>Nome</th>
        <th>Ações</th>
    </thead>
    <tbody>
        {#each data.editoras as editora}
            <tr>
                <td>{editora.nome}</td>
                <td>
                    <form method="POST">
                        <button formaction="?/editar"><i class="fa-solid fa-pen-to-square">Editar</i></button>
                        <button formaction="?/excluir"><i class="fa-regular fa-trash-can">Excluir</i></button>
                    </form>
                </td>
            </tr>
        {/each}
    </tbody>
</table>
