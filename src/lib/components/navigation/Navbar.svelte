<script lang="ts">
	import type { Snippet } from 'svelte';
	import { resolve } from '$app/paths';

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

	let { username, userid, sidebarExpanded, onToggleSidebar, search }: Props = $props();
	let dropdownOpen = $state(false);
	let theme = $state<'light' | 'dark'>('light');

	function changeTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', theme);
	}
</script>

<div
	data-testid="regiao-barra-superior"
	class="sticky top-0 z-40 flex h-topbar items-center gap-3 border-b border-divider bg-topbar/90 px-4 backdrop-blur tablet:px-6 desktop:px-10 print:hidden">
	<button
		type="button"
		aria-label="menu"
		aria-expanded={sidebarExpanded}
		class={[ICON_BUTTON, 'rounded-md desktop:hidden']}
		onclick={onToggleSidebar}>
		<i class="fa-solid fa-bars fa-fw" aria-hidden="true"></i>
	</button>
	<div class="flex min-w-0 flex-1 items-center">
		{@render search?.()}
	</div>
	<button aria-label={theme} type="button" class={ICON_BUTTON} data-theme-toggle onclick={changeTheme}>
		<i class={['fa-regular fa-fw', theme === 'light' ? 'fa-sun' : 'fa-moon']} aria-hidden="true"></i>
	</button>
	<div id="dropdown" class="relative">
		<button
			type="button"
			aria-haspopup="true"
			aria-controls="dropdown-menu"
			aria-expanded={dropdownOpen}
			class="grid size-10 place-items-center rounded-full bg-primary-600 font-bold text-on-primary transition-colors hover:bg-primary-700 aria-expanded:ring-2 aria-expanded:ring-accent aria-expanded:ring-offset-2 aria-expanded:ring-offset-topbar motion-reduce:transition-none"
			onclick={() => (dropdownOpen = !dropdownOpen)}>
			<span><strong>{username.substring(0, 1).toUpperCase()}</strong></span>
		</button>
		<div
			id="dropdown-menu"
			role="menu"
			hidden={!dropdownOpen}
			class="absolute top-full right-0 z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-lg border border-divider bg-surface p-1.5 shadow-raised">
			<p class="px-3 py-2 text-sm text-ink-muted">Bem vindo(a), {username.substring(0, username.indexOf(' '))}</p>
			<hr class="my-1" />
			<a
				href={resolve('/(protected)/usuario/[id=alphanumeric]', { id: userid })}
				class={[MENU_ENTRY, 'text-ink hover:bg-surface-muted hover:no-underline']}>
				Configurações
			</a>
			<hr class="my-1" />
			<form action="/logout" method="POST">
				<button
					class={[MENU_ENTRY, 'w-full gap-2 font-medium text-danger-ink hover:bg-danger-soft']}
					aria-label="sair"
					type="submit">
					<i class="fa-solid fa-right-from-bracket fa-fw" aria-hidden="true"></i>Sair
				</button>
			</form>
		</div>
	</div>
</div>
