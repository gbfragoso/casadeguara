<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import Button from '#lib/components/actions/Button.svelte';
	import InlineNotification from '#lib/components/feedback/InlineNotification.svelte';

	type Props = { message: string; class?: ClassValue };

	let { message, class: className }: Props = $props();
</script>

<InlineNotification kind="danger" role="alert" class={['items-center', className]}>
	<div class="flex flex-1 flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
		<p>{message}</p>
		<Button size="small" class="print:hidden" onclick={() => window.location.reload()}>Tentar novamente</Button>
	</div>
</InlineNotification>
