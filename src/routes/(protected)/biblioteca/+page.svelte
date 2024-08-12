<script lang="ts">
    import dayjs from "dayjs";
    import utc from "dayjs/plugin/utc";
    import type { PageServerData } from "./$types";
    export let data: PageServerData;

    $: ({ avisos, emprestimos, devolucoes, renovacoes } = data);
    dayjs.extend(utc);
</script>

<div>
    <nav class="breadcrumb m-0" aria-label="breadcrumbs">
        <ul>
            <li><a href="/biblioteca">Biblioteca</a></li>
            <li class="is-active">
                <a href="/biblioteca" aria-current="page">Página Inicial</a>
            </li>
        </ul>
    </nav>
    <h1 class="is-size-3 has-text-weight-semibold">
        Balanço do mês {dayjs.utc(new Date()).format("MM/YYYY")}
    </h1>
</div>
<div class="mt-2 columns">
    <div class="column">
        <div class="box has-text-weight-semibold">
            <i class="fa-solid fa-arrow-right">&nbsp;</i>Empréstimos
            <h2 class="is-size-3 has-text-primary">
                {emprestimos}
            </h2>
        </div>
    </div>
    <div class="column">
        <div class="box has-text-weight-semibold">
            <i class="fa-solid fa-arrow-left">&nbsp;</i>Devoluções
            <h2 class="is-size-3 has-text-primary">
                {devolucoes}
            </h2>
        </div>
    </div>
    <div class="column">
        <div class="box has-text-weight-semibold">
            <i class="fa-solid fa-repeat">&nbsp;</i>Renovações
            <h2 class="is-size-3 has-text-primary">
                {renovacoes}
            </h2>
        </div>
    </div>
</div>
<p class="is-size-4 mb-4 has-text-weight-semibold">Mural de avisos</p>
{#each avisos as aviso}
    <div class="box">
        <div class="content">
            <p>
                <strong class="has-text-primary">Clébio Fragoso</strong>
                <small
                    >{dayjs
                        .utc(aviso.data_cadastro)
                        .format("DD/MM/YYYY")}</small
                >
                <br />
                {aviso.texto}
            </p>
        </div>
    </div>
{/each}
