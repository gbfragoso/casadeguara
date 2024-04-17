<script lang="ts">
    import type { PageData } from "./$types";
    export let data: PageData;

    function formatarData(date: string) {
        return new Date(date).toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "long",
            timeZone: "America/Sao_Paulo",
        }).substring(0,10);
    }
</script>

<section>
    <h2>Saídas</h2>
    <table>
        <thead>
            <th scope="col">Valor</th>
            <th scope="col">Data</th>
            <th scope="col">Ações</th>
        </thead>
        <tbody>
            {#each data.saidas as saida}
                <tr>
                    <td>{saida.valor}</td>
                    <td>{formatarData(saida.data_saida)}</td>
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
</section>
