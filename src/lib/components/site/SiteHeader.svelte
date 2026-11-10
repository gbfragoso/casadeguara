<script lang="ts">
	import { resolve } from '$app/paths';
	import institutionSeal from '#lib/brand/casa-de-guara-seal.png';
	import { LOGIN_PATH } from '#lib/navigation/system-modules.js';
	import { SITE_MENU, isCurrentPage } from '#lib/site/menu.js';

	import SiteNavGroup from './SiteNavGroup.svelte';
	import SiteIcon from './SiteIcon.svelte';

	type Props = { currentPath: string };

	let { currentPath }: Props = $props();

	let menuOpen = $state(false);
	let openGroupId = $state<string | null>(null);

	const closeGroup = () => {
		openGroupId = null;
	};

	const toggleGroup = (id: string) => {
		openGroupId = openGroupId === id ? null : id;
	};

	const closeMenu = () => {
		menuOpen = false;
		closeGroup();
	};
</script>

<header class="absolute inset-x-0 top-0 z-20 bg-sky/60 backdrop-blur-md">
	<div class="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4 tablet:px-8 desktop:py-5">
		<a href={resolve('')} class="flex items-center gap-3 rounded-full">
			<img src={institutionSeal} alt="" class="size-12 shrink-0 desktop:size-14" />
			<span class="leading-tight">
				<span class="block font-display text-2xl font-extrabold text-primary-ink">Casa de Guará</span>
				<span class="block text-sm text-ink-muted">Grupo Espírita · Itabuna-BA</span>
			</span>
		</a>
		<button
			type="button"
			class="ms-auto inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-card text-lg text-primary-ink desktop:hidden"
			aria-label="Menu"
			aria-expanded={menuOpen}
			aria-controls="menu-do-site"
			onclick={() => (menuOpen = !menuOpen)}>
			<SiteIcon name={menuOpen ? 'close' : 'menu'} />
		</button>
		<nav
			id="menu-do-site"
			aria-label="Menu do site"
			class={['w-full desktop:ms-auto desktop:block desktop:w-auto', menuOpen ? 'block' : 'hidden']}>
			<ul
				class="flex flex-col gap-1 rounded-3xl bg-card p-3 text-lg font-semibold text-ink-strong desktop:flex-row desktop:items-center desktop:bg-transparent desktop:p-0">
				{#each SITE_MENU as item (item.rotulo)}
					{#if item.kind === 'group'}
						<SiteNavGroup
							group={item}
							{currentPath}
							open={openGroupId === item.id}
							onToggle={() => toggleGroup(item.id)}
							onClose={closeGroup}
							onNavigate={closeMenu} />
					{:else}
						<li>
							<a
								href={resolve(item.path)}
								aria-current={isCurrentPage(item, currentPath) ? 'page' : undefined}
								onclick={closeMenu}
								class="block rounded-full px-4 py-2.5 text-ink-strong hover:bg-sky hover:no-underline aria-[current=page]:bg-sky aria-[current=page]:text-primary-ink desktop:hover:bg-surface desktop:aria-[current=page]:bg-card">
								{item.rotulo}
							</a>
						</li>
					{/if}
				{/each}
				<li class="mt-2 desktop:ms-3 desktop:mt-0">
					<a
						href={resolve(LOGIN_PATH)}
						class="block rounded-full bg-primary px-5 py-3 text-center font-bold text-on-primary hover:bg-primary-700 hover:no-underline">
						Login
					</a>
				</li>
			</ul>
		</nav>
	</div>
</header>
