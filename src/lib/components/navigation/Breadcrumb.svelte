<script lang="ts">
	import type { ResolvedPathname } from '$app/types';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';

	type BreadcrumbItem = { label: string; href: ResolvedPathname };
	type Props = Omit<HTMLAttributes<HTMLElement>, 'class' | 'children'> & {
		items: readonly BreadcrumbItem[];
		class?: ClassValue;
	};

	let { items, class: className, ...rest }: Props = $props();
</script>

<nav {...rest} aria-label="Trilha de navegação" class={['print:hidden', className]}>
	<ol class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm wrap-anywhere">
		{#each items as item, index (item.label)}
			{@const current = index === items.length - 1}
			<li class="flex items-center gap-2">
				{#if index > 0}
					<i class="fa-solid fa-chevron-right fa-fw text-xs text-ink-muted" aria-hidden="true"></i>
				{/if}
				<a
					href={item.href}
					aria-current={current ? 'page' : undefined}
					class={current ? 'font-medium text-ink-strong' : 'text-ink-muted hover:text-primary-ink'}
					>{item.label}</a>
			</li>
		{/each}
	</ol>
</nav>
