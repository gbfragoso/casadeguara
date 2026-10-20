<script lang="ts">
	import type { ComponentProps, Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import Breadcrumb from '#lib/components/navigation/Breadcrumb.svelte';

	type Props = {
		breadcrumb: ComponentProps<typeof Breadcrumb>['items'];
		icon?: string;
		printTitle?: boolean;
		class?: ClassValue;
		children: Snippet;
	};

	let { breadcrumb, icon, printTitle = true, class: className, children }: Props = $props();
</script>

<header
	data-print={printTitle ? undefined : 'hidden'}
	class={['mb-6 flex flex-col gap-3 print:data-[print=hidden]:hidden', className]}>
	<Breadcrumb items={breadcrumb} />
	<h1 class="flex items-center gap-3 text-2xl font-bold text-primary-ink tablet:text-3xl">
		{#if icon}
			<span
				aria-hidden="true"
				class="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-lg text-primary-ink print:hidden">
				<i class={[icon, 'fa-fw']}></i>
			</span>
		{/if}
		{@render children()}
	</h1>
</header>
