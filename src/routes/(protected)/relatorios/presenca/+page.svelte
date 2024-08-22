<script lang="ts">
    import type { PageServerData } from "./$types";
    export let data: PageServerData;

    $: ({ leitores, datas } = data);
</script>

<table class="table is-striped">
    <thead>
        {#each datas as date}
            <th>
                {date}
            </th>
        {/each}
        <th>Nome</th>
    </thead>
    <tbody>
        {#each leitores as leitor}
            <tr>
                {#each datas as date}
                    <td>[&nbsp;&nbsp;]</td>
                {/each}
                <td>
                    {leitor.nome.toUpperCase()}
                </td>
            </tr>
        {/each}
    </tbody>
</table>
