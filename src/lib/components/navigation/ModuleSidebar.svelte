<script lang="ts">
	import { page } from '$app/state';
	import { isMenuItemActive, visibleMenuItems, type ModuleMenuItem } from '#lib/components/navigation/module-menu.js';

	type Props = { items: readonly ModuleMenuItem[]; isAdmin: boolean; expanded: boolean };

	let { items, isAdmin, expanded }: Props = $props();
	let visibleItems = $derived(visibleMenuItems(items, isAdmin));
</script>

<div
	class="contents desktop:block desktop:w-sidebar desktop:shrink-0 desktop:border-r desktop:border-divider desktop:bg-sidebar print:hidden">
	<nav
		id="sidebar"
		data-testid="regiao-menu-lateral"
		class={[
			'w-sidebar max-w-[85vw] flex-col overflow-y-auto overscroll-contain border-r border-divider bg-sidebar desktop:sticky desktop:top-0 desktop:z-auto desktop:flex desktop:h-dvh desktop:max-w-none desktop:border-r-0 desktop:shadow-none print:hidden',
			expanded ? 'fixed top-topbar bottom-0 left-0 z-30 flex shadow-raised' : 'hidden',
		]}>
		<div class="flex justify-center px-6 pt-6 pb-5">
			<img src="/logo.png" id="user-avatar" alt="Avatar" class="size-16 object-contain" />
		</div>
		<ul class="flex flex-col gap-1 px-3 pb-6">
			{#each visibleItems as item (item.href)}
				<li>
					<a
						href={item.href}
						aria-label={item.ariaLabel}
						title={item.title}
						aria-current={isMenuItemActive(page.url, item) ? 'page' : undefined}
						class="group relative flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-sidebar-ink transition-colors hover:bg-sidebar-hover hover:text-sidebar-hover-ink hover:no-underline aria-[current=page]:bg-sidebar-active aria-[current=page]:font-bold aria-[current=page]:text-sidebar-active-ink motion-reduce:transition-none">
						<i
							class={[
								item.icon,
								'fa-fw text-ink-muted group-hover:text-sidebar-hover-ink group-aria-[current=page]:text-sidebar-active-icon',
							]}
							aria-hidden="true"></i>
						<span>{item.label}</span>
						<span
							aria-hidden="true"
							class="absolute inset-y-0 right-0 hidden w-1.5 rounded-r-md bg-sidebar-marker group-aria-[current=page]:block"
						></span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</div>
