<script lang="ts">
	import Button from '#lib/components/actions/Button.svelte';
	import InlineNotification from '#lib/components/feedback/InlineNotification.svelte';
	import SectionHeading from '#lib/components/layout/SectionHeading.svelte';
	import {
		copyArt,
		readBrowserPlatform,
		readDeliveryOptions,
		shareArt,
		type DeliveryOptions,
		type DeliveryPlatform,
	} from '#lib/talks/art/delivery.js';
	import { buildTalkArtFileName, describeTalkArt } from '#lib/talks/art/format.js';
	import type { ReadyTalk } from '#lib/talks/art/readiness.js';
	import { requestTalkArt } from '#lib/talks/art/request.js';
	import type { TalkCard } from '#lib/talks/types.js';

	type ArtState =
		| { status: 'idle' }
		| { status: 'loading' }
		| { status: 'ready'; image: Blob; file: File; url: string; options: DeliveryOptions }
		| { status: 'failed'; message: string };
	type Feedback = { kind: 'success' | 'danger'; message: string };
	type Props = {
		id: string;
		talk: ReadyTalk<TalkCard>;
		onStale: () => Promise<void>;
		fetcher?: typeof fetch;
		platform?: DeliveryPlatform;
	};

	const COPIED_MESSAGE = 'Imagem copiada.';
	const COPY_FAILURE_MESSAGE = 'Não foi possível copiar a imagem. Use “Baixar” para salvar a arte.';
	const SHARE_FAILURE_MESSAGE = 'Não foi possível compartilhar a imagem. Use “Baixar” para salvar a arte.';

	let { id, talk, onStale, fetcher = fetch, platform = readBrowserPlatform() }: Props = $props();

	let art = $state.raw<ArtState>({ status: 'idle' });
	let feedback = $state.raw<Feedback | null>(null);
	let dialog = $state<HTMLElement>();
	let controller: AbortController | undefined;

	const fileName = $derived(buildTalkArtFileName(talk.data, talk.horario));
	const description = $derived(describeTalkArt(talk));

	function showArt(image: Blob) {
		const file = new File([image], fileName, { type: image.type });
		const options = readDeliveryOptions(platform, file);
		art = { status: 'ready', image, file, url: URL.createObjectURL(image), options };
	}

	async function loadArt() {
		const request = new AbortController();
		controller = request;
		art = { status: 'loading' };
		const result = await requestTalkArt(fetcher, talk, request.signal);
		if (request.signal.aborted) return;
		if (result.ok) return showArt(result.image);

		art = { status: 'failed', message: result.message };
		if (result.stale) await onStale();
	}

	function releaseArt() {
		controller?.abort();
		controller = undefined;
		if (art.status === 'ready') URL.revokeObjectURL(art.url);
	}

	function handleToggle(event: ToggleEvent) {
		if (event.newState === 'open') {
			dialog?.focus();
			void loadArt();
			return;
		}
		releaseArt();
		art = { status: 'idle' };
		feedback = null;
	}

	async function copy(image: Blob) {
		const outcome = await copyArt(platform, image);
		feedback =
			outcome === 'copied'
				? { kind: 'success', message: COPIED_MESSAGE }
				: { kind: 'danger', message: COPY_FAILURE_MESSAGE };
	}

	async function share(file: File) {
		feedback = null;
		const outcome = await shareArt(platform, file);
		if (outcome === 'failed') feedback = { kind: 'danger', message: SHARE_FAILURE_MESSAGE };
	}

	const releaseOnUnmount = () => releaseArt;
</script>

<div
	{id}
	bind:this={dialog}
	{@attach releaseOnUnmount}
	popover="auto"
	role="dialog"
	tabindex="-1"
	aria-labelledby={`${id}-titulo`}
	ontoggle={handleToggle}
	class="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg flex-col gap-4 overflow-y-auto rounded-xl bg-surface p-4 text-left text-ink shadow-raised backdrop:bg-overlay/60 open:flex tablet:p-6">
	<SectionHeading element="p" id={`${id}-titulo`} icon="fa-solid fa-image">Arte para redes sociais</SectionHeading>
	{#if art.status === 'ready'}
		<img src={art.url} alt={description} width="1080" height="1080" class="h-auto w-full rounded-lg" />
	{:else if art.status === 'failed'}
		<InlineNotification kind="danger" role="alert">{art.message}</InlineNotification>
	{:else if art.status === 'loading'}
		<div
			role="status"
			class="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-lg bg-surface-muted text-ink-muted">
			<span
				aria-hidden="true"
				class="size-8 animate-spin rounded-full border-4 border-current border-r-transparent motion-reduce:animate-none"
			></span>
			Gerando a arte…
		</div>
	{/if}
	{#if feedback}
		<InlineNotification kind={feedback.kind} role={feedback.kind === 'success' ? 'status' : 'alert'}>
			{feedback.message}
		</InlineNotification>
	{/if}
	<div class="flex flex-col gap-3 tablet:flex-row tablet:flex-wrap tablet:justify-end">
		{#if art.status === 'ready'}
			{@const { image, file, url, options } = art}
			<Button tone="primary" href={url} download={fileName}>
				<i class="fa-solid fa-download fa-fw" aria-hidden="true"></i>Baixar
			</Button>
			{#if options.share}
				<Button type="button" onclick={() => share(file)}>
					<i class="fa-solid fa-share-nodes fa-fw" aria-hidden="true"></i>Compartilhar
				</Button>
			{/if}
			{#if options.copy}
				<Button type="button" onclick={() => copy(image)}>
					<i class="fa-regular fa-copy fa-fw" aria-hidden="true"></i>Copiar
				</Button>
			{/if}
		{/if}
		<Button type="button" popovertarget={id} popovertargetaction="hide">Fechar</Button>
	</div>
</div>
