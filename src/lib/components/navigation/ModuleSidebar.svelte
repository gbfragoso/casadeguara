<script lang="ts">
	import { page } from '$app/state';
	import { isMenuItemActive, visibleMenuItems, type ModuleMenuItem } from '#lib/components/navigation/module-menu.js';

	type Props = {
		items: readonly ModuleMenuItem[];
		moduleName: string;
		isAdmin: boolean;
		expanded: boolean;
		onClose?: () => void;
	};

	let { items, moduleName, isAdmin, expanded, onClose }: Props = $props();
	let visibleItems = $derived(visibleMenuItems(items, isAdmin));
</script>

{#if expanded}
	<div
		aria-hidden="true"
		data-testid="fundo-menu-lateral"
		class="fixed inset-x-0 top-topbar bottom-0 z-20 bg-overlay/30 desktop:hidden print:hidden"
		onclick={onClose}>
	</div>
{/if}
<div class="contents desktop:block desktop:w-sidebar desktop:shrink-0 desktop:bg-sidebar print:hidden">
	<nav
		id="sidebar"
		aria-label="Menu do módulo"
		data-testid="regiao-menu-lateral"
		class={[
			'w-sidebar max-w-[85vw] [scrollbar-color:var(--color-sidebar-hover)_transparent] flex-col overflow-y-auto overscroll-contain bg-sidebar [--color-focus:var(--color-sidebar-focus)] desktop:sticky desktop:top-0 desktop:z-auto desktop:flex desktop:h-dvh desktop:max-w-none desktop:shadow-none print:hidden',
			expanded ? 'fixed top-topbar bottom-0 left-0 z-30 flex shadow-raised' : 'hidden',
		]}>
		<div class="mx-4 flex items-center gap-3 border-b border-sidebar-divider pt-6 pb-5">
			<span class="grid size-16 shrink-0 place-items-center rounded-full bg-white ring-2 ring-accent">
				<img src="/logo.png" alt="" class="size-13 object-contain" />
			</span>
			<p class="flex min-w-0 flex-col">
				<span class="text-lg leading-6 font-bold text-white">Casa de Guará</span>
				<span class="text-sidebar-ink">{moduleName}</span>
			</p>
		</div>
		<ul class="flex flex-col gap-1 px-3 py-4">
			{#each visibleItems as item (item.href)}
				<li>
					<a
						href={item.href}
						aria-label={item.ariaLabel}
						title={item.title}
						aria-current={isMenuItemActive(page.url, item) ? 'page' : undefined}
						class="group flex min-h-11 items-center gap-3 rounded-md px-3 font-medium text-sidebar-ink transition-colors hover:bg-sidebar-hover hover:text-sidebar-hover-ink hover:no-underline aria-[current=page]:bg-sidebar-active aria-[current=page]:font-bold aria-[current=page]:text-sidebar-active-ink motion-reduce:transition-none">
						<i
							class={[
								item.icon,
								'fa-fw text-sidebar-icon group-hover:text-sidebar-hover-ink group-aria-[current=page]:text-sidebar-active-icon',
							]}
							aria-hidden="true"></i>
						<span class="min-w-0">{item.label}</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</div>
