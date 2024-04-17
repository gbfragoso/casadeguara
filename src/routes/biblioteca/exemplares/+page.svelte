<script lang="ts">
    import type { PageServerData } from "./$types";
    export let data: PageServerData;
</script>

<div>Consulta exemplares</div>

<table>
    <thead>
        <th>Tombo</th>
        <th>Titulo</th>
        <th>Numero</th>
        <th>Status</th>
        <th>Ações</th>
    </thead>
    <tbody>
        {#each data.exemplares as exemplares}
            <tr>
                <td>{exemplares.livro_exemplar_livroTolivro.tombo}</td>
                <td>{exemplares.livro_exemplar_livroTolivro.titulo}</td>
                <td>{exemplares.numero}</td>
                <td>{exemplares.status}</td>
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
