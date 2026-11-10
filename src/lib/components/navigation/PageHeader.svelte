<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import { formatDocumentTitle } from '#lib/brand/document-title.js';
	import { readModuleName } from '#lib/components/layout/module-context.js';
	import Breadcrumb from '#lib/components/navigation/Breadcrumb.svelte';

	type Props = {
		breadcrumb: ComponentProps<typeof Breadcrumb>['items'];
		title: string;
		printTitle?: boolean;
		class?: ClassValue;
	};

	let { breadcrumb, title, printTitle = true, class: className }: Props = $props();
	const moduleName = readModuleName();
	let documentTitle = $derived(formatDocumentTitle(title, moduleName?.()));
</script>

<svelte:head>
	<title>{documentTitle}</title>
</svelte:head>

<header
	data-print={printTitle ? undefined : 'hidden'}
	class={['mb-6 flex flex-col gap-3 print:data-[print=hidden]:hidden', className]}>
	<Breadcrumb items={breadcrumb} />
	<h1 class="text-2xl font-bold wrap-anywhere text-primary-ink tablet:text-3xl">{title}</h1>
	<span aria-hidden="true" class="h-1 w-12 rounded-sm bg-accent print:hidden"></span>
</header>
