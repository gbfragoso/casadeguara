<script lang="ts">
    import type { PageServerData } from "./$types";
    export let data: PageServerData;
</script>

<div>Consulta autores</div>

<table>
    <thead>
        <th>Nome</th>
        <th>Ações</th>
    </thead>
    <tbody>
        {#each data.autores as autor}
            <tr>
                <td>{autor.nome}</td>
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
