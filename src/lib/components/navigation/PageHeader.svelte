<script lang="ts">
	import type { ComponentProps, Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import Breadcrumb from '#lib/components/navigation/Breadcrumb.svelte';

	type Props = {
		breadcrumb: ComponentProps<typeof Breadcrumb>['items'];
		printTitle?: boolean;
		class?: ClassValue;
		children: Snippet;
	};

	let { breadcrumb, printTitle = true, class: className, children }: Props = $props();
</script>

<header
	data-print={printTitle ? undefined : 'hidden'}
	class={['mb-6 flex flex-col gap-3 print:data-[print=hidden]:hidden', className]}>
	<Breadcrumb items={breadcrumb} />
	<h1 class="text-2xl font-bold wrap-anywhere text-primary-ink tablet:text-3xl">
		{@render children()}
	</h1>
	<span aria-hidden="true" class="h-1 w-12 rounded-sm bg-accent print:hidden"></span>
</header>
