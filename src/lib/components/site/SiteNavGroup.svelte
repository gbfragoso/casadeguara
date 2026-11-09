<script lang="ts">
	import { resolve } from '$app/paths';
	import { holdsCurrentPage, isCurrentPage, type SiteMenuGroup } from '#lib/site/menu.js';

	type Props = {
		group: SiteMenuGroup;
		currentPath: string;
		open: boolean;
		onToggle: () => void;
		onClose: () => void;
		onNavigate: () => void;
	};

	let { group, currentPath, open, onToggle, onClose, onNavigate }: Props = $props();

	let container: HTMLLIElement;
	let button: HTMLButtonElement;

	let submenuId = $derived(`submenu-${group.id}`);
	let holdsCurrent = $derived(holdsCurrentPage(group, currentPath));

	const isInside = (target: EventTarget | null) => target instanceof Node && container.contains(target);

	const closeOnEscape = (event: KeyboardEvent) => {
		if (!open || event.key !== 'Escape') return;
		onClose();
		button.focus();
	};

	const closeWhenFocusLeaves = (event: FocusEvent) => {
		if (open && event.relatedTarget && !isInside(event.relatedTarget)) onClose();
	};

	const closeOnOutsideClick = (event: MouseEvent) => {
		if (open && !isInside(event.target)) onClose();
	};

	const watchFocusLeaving = (element: HTMLLIElement) => {
		element.addEventListener('focusout', closeWhenFocusLeaves);
		return () => element.removeEventListener('focusout', closeWhenFocusLeaves);
	};
</script>

<svelte:document onclick={closeOnOutsideClick} onkeydown={closeOnEscape} />

<li bind:this={container} class="relative" {@attach watchFocusLeaving}>
	<button
		bind:this={button}
		type="button"
		aria-expanded={open}
		aria-controls={submenuId}
		data-current-section={holdsCurrent || undefined}
		onclick={onToggle}
		class="flex w-full items-center justify-between gap-2 rounded-full px-4 py-2.5 text-start text-ink-strong hover:bg-sky data-current-section:text-primary-ink desktop:w-auto desktop:hover:bg-surface desktop:data-current-section:bg-card">
		<span>
			{group.rotulo}
			{#if holdsCurrent}<span class="sr-only">(seção atual)</span>{/if}
		</span>
		<i
			class={[
				'fa-solid fa-chevron-down text-sm transition-transform duration-200 motion-reduce:transition-none',
				open && 'rotate-180',
			]}
			aria-hidden="true"></i>
	</button>
	<ul
		id={submenuId}
		hidden={!open}
		class="mt-1 grid gap-1 ps-4 desktop:absolute desktop:top-full desktop:left-0 desktop:z-10 desktop:mt-2 desktop:w-max desktop:min-w-60 desktop:rounded-3xl desktop:bg-card desktop:p-2">
		{#each group.links as link (link.path)}
			<li>
				<a
					href={resolve(link.path)}
					aria-current={isCurrentPage(link, currentPath) ? 'page' : undefined}
					onclick={onNavigate}
					class="block rounded-full px-4 py-2.5 text-base text-ink-strong hover:bg-sky hover:no-underline aria-[current=page]:bg-sky aria-[current=page]:text-primary-ink desktop:rounded-2xl desktop:text-lg">
					{link.rotulo}
				</a>
			</li>
		{/each}
	</ul>
</li>
