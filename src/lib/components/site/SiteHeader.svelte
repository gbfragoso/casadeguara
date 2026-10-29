<script lang="ts">
	import { resolve } from '$app/paths';
	import { LOGIN_PATH } from '#lib/navigation/system-modules.js';
	import { SITE_SECTIONS } from '#lib/site/sections.js';

	let menuOpen = $state(false);

	const closeMenu = () => {
		menuOpen = false;
	};
</script>

<header class="absolute inset-x-0 top-0 z-20 bg-sky/60 backdrop-blur-md">
	<div class="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4 tablet:px-8 desktop:py-5">
		<a href="#inicio" class="flex items-center gap-3 rounded-full">
			<img
				src="/logo.png"
				alt=""
				class="size-12 shrink-0 rounded-full bg-white object-contain p-1 desktop:size-14" />
			<span class="leading-tight">
				<span class="block font-display text-2xl font-extrabold text-primary-ink">Casa de Guará</span>
				<span class="block text-sm text-ink-muted">Grupo Espírita · Itabuna-BA</span>
			</span>
		</a>
		<button
			type="button"
			class="ms-auto inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-surface text-lg text-primary-ink desktop:hidden"
			aria-label="Menu"
			aria-expanded={menuOpen}
			aria-controls="menu-do-site"
			onclick={() => (menuOpen = !menuOpen)}>
			<i class={['fa-solid', menuOpen ? 'fa-xmark' : 'fa-bars']} aria-hidden="true"></i>
		</button>
		<nav
			id="menu-do-site"
			aria-label="Seções da página"
			class={['w-full desktop:ms-auto desktop:block desktop:w-auto', menuOpen ? 'block' : 'hidden']}>
			<ul
				class="flex flex-col gap-1 rounded-3xl bg-surface p-3 text-lg font-semibold text-ink-strong desktop:flex-row desktop:items-center desktop:bg-transparent desktop:p-0">
				{#each SITE_SECTIONS as section (section.id)}
					<li>
						<a
							href={`#${section.id}`}
							class="block rounded-full px-4 py-2.5 text-ink-strong hover:bg-sky desktop:hover:bg-surface"
							onclick={closeMenu}>{section.rotulo}</a>
					</li>
				{/each}
				<li class="mt-2 desktop:ms-3 desktop:mt-0">
					<a
						href={resolve(LOGIN_PATH)}
						class="block rounded-full bg-primary px-5 py-3 text-center font-bold text-on-primary hover:bg-primary-700">
						Login
					</a>
				</li>
			</ul>
		</nav>
	</div>
</header>
