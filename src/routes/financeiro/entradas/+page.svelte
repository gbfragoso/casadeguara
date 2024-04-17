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
    <h2>Entradas</h2>
    <table>
        <thead>
            <th scope="col">Contribuinte</th>
            <th scope="col">Valor</th>
            <th scope="col">Data</th>
        </thead>
        <tbody>
            {#each data.entradas as entrada}
                <tr>
                    <td>{entrada.contribuinte_entradas_contribuinteTocontribuinte?.nome}</td>
                    <td>{entrada.valor}</td>
                    <td>{formatarData(entrada.data_entrada)}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</section>
