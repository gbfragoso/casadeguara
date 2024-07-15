<script lang="ts">
    import type { PageServerData } from "./$types";
    export let data: PageServerData;
    $: ({ } = data);
</script>

<section class="hero is-info is-large header-image">
    <div class="hero-head">
        <nav class="navbar">
            <div class="container">
                <div class="navbar-brand">
                    <a href="/" class="navbar-item">
                        <img
                            src="https://casadeguara.org/wp-content/uploads/2017/12/cropped-logo.png"
                            alt="Logo"
                        />
                    </a>
                    <span class="navbar-burger" data-target="navbarMenuHeroB">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </div>
                <div id="navbarMenuHeroB" class="navbar-menu">
                    <div class="navbar-end">
                        <a href="/" class="navbar-item">Eventos</a>
                        <a href="/" class="navbar-item">Material</a>
                        <span class="navbar-item">
                            <a href="/login" class="button is-white">
                                <span>Login</span>
                            </a>
                        </span>
                    </div>
                </div>
            </div>
        </nav>
    </div>

    <div class="hero-body">
        <div class="container">
            <p class="subtitle">Existem muitos caminhos para felicidade...</p>
            <p class="title">E um deles é a Casa de Guará</p>
        </div>
    </div>
</section>
<section class="section is-medium">
    <h1 class="title">Conheça nosso canal no YouTube</h1>
    <div class="columns">
        
    </div>
</section>
<section class="section is-medium">
    <h1 class="title">Obras assistenciais</h1>
</section>
<section class="section is-medium">
    <h1 class="title">Sobre nós</h1>
    <p>
        O Grupo Espírita Casa de Guará foi fundado em 13/05/1966 na cidade de
        Itabuna/BA na residência do casal Omar Canna Brasil e Josefa Cleides
        Costa (Dona Clei). O Grupo, inicialmente familiar, logo sentiu
        necessidade de uma sede própria por conta no número crescente de
        frequentadores. Ainda mantendo a orientação Umbandista, em respeito ao
        casal de dirigentes original, foi decidido em assembleia geral o
        estabelecimento jurídico da instituição e a criação da comissão de
        construção da sede própria, presidida pelo irmão Eliés Haun, em terreno
        que foi adquirido na rua Major Dórea, 86, bairro Castália (sede atual).
        Após a desencarnação de Dona Clei o Grupo adotou oficialmente a
        orientação de Kardec.
    </p>
</section>
