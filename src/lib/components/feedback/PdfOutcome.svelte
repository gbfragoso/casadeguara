<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '#lib/components/actions/Button.svelte';
	import InlineNotification from '#lib/components/feedback/InlineNotification.svelte';
	import type { PdfDeliveryState } from '#lib/pdf/delivery.svelte.js';

	type ActivePdf = Exclude<PdfDeliveryState<unknown, { message: string }>, { status: 'idle' }>;
	type Props = {
		outcome: ActivePdf;
		loadingLabel: string;
		readyLabel: string;
		fileName: string;
		details?: Snippet;
		actions?: Snippet;
	};

	let { outcome, loadingLabel, readyLabel, fileName, details, actions }: Props = $props();
</script>

{#if outcome.status === 'loading'}
	<div role="status" class="flex items-center gap-3 rounded-lg bg-surface-muted p-4 text-ink-muted">
		<span
			aria-hidden="true"
			class="size-5 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
		></span>
		{loadingLabel}
	</div>
{:else if outcome.status === 'ready'}
	<InlineNotification kind="success" role="status">{readyLabel}</InlineNotification>
{:else}
	<InlineNotification kind="warning" role="alert">
		<div class="flex flex-col gap-2">
			<p>{outcome.message}</p>
			{@render details?.()}
		</div>
	</InlineNotification>
{/if}
{#if outcome.status === 'ready' || actions}
	<div class="flex flex-col gap-3 tablet:flex-row tablet:flex-wrap tablet:justify-end">
		{#if outcome.status === 'ready'}
			<Button tone="primary" href={outcome.url} target="_blank" rel="noopener">
				<i class="fa-solid fa-print fa-fw" aria-hidden="true"></i>Abrir para imprimir
			</Button>
			<Button href={outcome.url} download={fileName}>
				<i class="fa-solid fa-download fa-fw" aria-hidden="true"></i>Baixar
			</Button>
		{/if}
		{@render actions?.()}
	</div>
{/if}
