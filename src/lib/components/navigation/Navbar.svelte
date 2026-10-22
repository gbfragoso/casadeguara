<script lang="ts">
	import type { Snippet } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { resolve } from '$app/paths';

	type Theme = 'light' | 'dark';
	type Props = {
		username: string;
		userid: string;
		sidebarExpanded: boolean;
		onToggleSidebar: () => void;
		search?: Snippet;
	};

	const ICON_BUTTON =
		'grid size-10 shrink-0 place-items-center rounded-full text-lg text-ink-strong transition-colors hover:bg-surface-muted motion-reduce:transition-none';
	const MENU_ENTRY = 'flex min-h-10 items-center rounded-md px-3 text-sm';
	const THEME_TOGGLE_LABELS: Record<Theme, string> = { light: 'Ativar tema escuro', dark: 'Ativar tema claro' };

	let { username, userid, sidebarExpanded, onToggleSidebar, search }: Props = $props();
	let dropdownOpen = $state(false);
	let userMenu: HTMLElement | undefined;
	let userMenuTrigger: HTMLButtonElement | undefined;
	let sidebarToggle: HTMLButtonElement | undefined;
	let firstName = $derived(username.trim().split(/\s+/)[0]);
	let initial = $derived(firstName.charAt(0).toUpperCase());

	const systemPrefersDark = new MediaQuery('(prefers-color-scheme: dark)', false);
	let chosenTheme = $state<Theme>();
	let theme: Theme = $derived(chosenTheme ?? (systemPrefersDark.current ? 'dark' : 'light'));

	function readChosenTheme(): Theme | undefined {
		const value = document.documentElement.dataset.theme;
		return value === 'light' || value === 'dark' ? value : undefined;
	}

	function syncChosenTheme() {
		chosenTheme = readChosenTheme();
	}

	function changeTheme() {
		chosenTheme = theme === 'light' ? 'dark' : 'light';
		document.documentElement.dataset.theme = chosenTheme;
	}

	function closeOpenPanelOnEscape(event: KeyboardEvent) {
		if (event.key !== 'Escape') return;
		if (dropdownOpen) {
			dropdownOpen = false;
			userMenuTrigger?.focus();
		} else if (sidebarExpanded) {
			onToggleSidebar();
			sidebarToggle?.focus();
		}
	}

	function closeUserMenuOutside(target: EventTarget | null) {
		if (target instanceof Node && userMenu?.contains(target)) return;
		dropdownOpen = false;
	}
</script>

<svelte:window
	onkeydown={closeOpenPanelOnEscape}
	onpointerdown={(event) => dropdownOpen && closeUserMenuOutside(event.target)} />

<div
	data-testid="regiao-barra-superior"
	class="sticky top-0 z-40 flex h-topbar items-center gap-3 border-b border-divider bg-topbar/90 px-4 backdrop-blur tablet:px-6 desktop:px-10 print:hidden">
	<button
		type="button"
		aria-label="menu"
		aria-expanded={sidebarExpanded}
		aria-controls="sidebar"
		bind:this={sidebarToggle}
		class={[ICON_BUTTON, 'rounded-md desktop:hidden']}
		onclick={onToggleSidebar}>
		<i class="fa-solid fa-bars fa-fw" aria-hidden="true"></i>
	</button>
	<div class="flex min-w-0 flex-1 items-center">
		{@render search?.()}
	</div>
	<button
		aria-label={THEME_TOGGLE_LABELS[theme]}
		type="button"
		class={ICON_BUTTON}
		data-theme-toggle
		{@attach syncChosenTheme}
		onclick={changeTheme}>
		<i class={['fa-regular fa-fw', theme === 'light' ? 'fa-sun' : 'fa-moon']} aria-hidden="true"></i>
	</button>
	<div
		id="dropdown"
		class="relative"
		bind:this={userMenu}
		onfocusout={(event) => dropdownOpen && closeUserMenuOutside(event.relatedTarget)}>
		<button
			type="button"
			aria-label="Menu do usuário"
			aria-controls="dropdown-menu"
			aria-expanded={dropdownOpen}
			bind:this={userMenuTrigger}
			class="grid size-10 place-items-center rounded-full bg-primary-600 font-bold text-on-primary transition-colors hover:bg-primary-700 aria-expanded:ring-2 aria-expanded:ring-accent aria-expanded:ring-offset-2 aria-expanded:ring-offset-topbar motion-reduce:transition-none"
			onclick={() => (dropdownOpen = !dropdownOpen)}>
			{#if initial}
				<strong aria-hidden="true">{initial}</strong>
			{:else}
				<i class="fa-solid fa-user fa-fw" aria-hidden="true"></i>
			{/if}
		</button>
		<div
			id="dropdown-menu"
			hidden={!dropdownOpen}
			class="absolute top-full right-0 z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-lg border border-divider bg-surface p-1.5 wrap-anywhere shadow-raised">
			<p class="px-3 py-2 text-sm text-ink-muted">Bem-vindo(a){firstName ? `, ${firstName}` : ''}</p>
			<hr class="my-1" />
			<a
				href={resolve('/(protected)/usuario/[id=alphanumeric]', { id: userid })}
				class={[MENU_ENTRY, 'gap-2 text-ink hover:bg-surface-muted hover:no-underline']}>
				<i class="fa-solid fa-user-gear fa-fw text-ink-muted" aria-hidden="true"></i>Meu cadastro
			</a>
			<a
				href={resolve('/(protected)/sistemas')}
				class={[MENU_ENTRY, 'gap-2 text-ink hover:bg-surface-muted hover:no-underline']}>
				<i class="fa-solid fa-table-cells-large fa-fw text-ink-muted" aria-hidden="true"></i>Trocar módulo
			</a>
			<hr class="my-1" />
			<form action="/logout" method="POST">
				<button
					class={[MENU_ENTRY, 'w-full gap-2 font-medium text-danger-ink hover:bg-danger-soft']}
					type="submit">
					<i class="fa-solid fa-right-from-bracket fa-fw" aria-hidden="true"></i>Sair
				</button>
			</form>
		</div>
	</div>
</div>
