<script lang="ts">
    import type { PageServerData } from "./$types";
    export let data: PageServerData;
</script>

<div>Consulta livros</div>

<table>
    <thead>
        <th>Tombo</th>
        <th>Título</th>
        <th>Editora</th>
        <th>Ações</th>
    </thead>
    <tbody>
        {#each data.livros as livro}
            <tr>
                <td>{livro.tombo}</td>
                <td>{livro.titulo}</td>
                <td>{livro.editora_livro_editoraToeditora?.nome}</td>
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
