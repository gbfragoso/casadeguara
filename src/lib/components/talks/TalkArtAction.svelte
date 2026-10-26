<script lang="ts">
	import IconAction from '#lib/components/actions/IconAction.svelte';
	import TalkArtDialog from '#lib/components/talks/TalkArtDialog.svelte';
	import type { TalkArtReadiness } from '#lib/talks/art/readiness.js';
	import type { TalkCard } from '#lib/talks/types.js';

	type Props = {
		id: string;
		name: string;
		readiness: TalkArtReadiness<TalkCard>;
		onBlocked: () => void;
		onStale: () => Promise<void>;
	};

	let { id, name, readiness, onBlocked, onStale }: Props = $props();

	const dialogId = $derived(`${id}-arte`);
</script>

<IconAction
	icon="fa-solid fa-image"
	size="large"
	aria-label={`Gerar arte para redes sociais: ${name}`}
	title="Gerar arte"
	popovertarget={readiness.ready ? dialogId : undefined}
	onclick={readiness.ready ? undefined : onBlocked} />
{#if readiness.ready}
	<TalkArtDialog id={dialogId} talk={readiness.talk} {onStale} />
{/if}
