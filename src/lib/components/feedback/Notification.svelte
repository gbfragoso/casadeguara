<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Tone } from '#lib/components/feedback/tone.js';

	type Props = { kind: Tone; children: Snippet };

	const TONES: Record<Tone, string> = {
		primary: 'bg-primary-600 text-on-primary',
		link: 'bg-primary-600 text-on-primary',
		info: 'bg-info text-on-info',
		success: 'bg-success text-on-success',
		warning: 'bg-warning text-on-warning',
		danger: 'bg-danger text-on-danger',
	};

	const ICONS: Record<Tone, string> = {
		primary: 'fa-solid fa-circle-info',
		link: 'fa-solid fa-circle-info',
		info: 'fa-solid fa-circle-info',
		success: 'fa-solid fa-circle-check',
		warning: 'fa-solid fa-triangle-exclamation',
		danger: 'fa-solid fa-circle-exclamation',
	};

	let { kind, children }: Props = $props();
	let dismissed = $state(false);
</script>

<div
	data-testid="regiao-notificacao"
	hidden={dismissed}
	class={[
		'fixed right-4 bottom-4 left-4 z-50 flex items-start gap-3 rounded-lg p-4 pr-14 shadow-raised tablet:left-auto tablet:w-full tablet:max-w-notification print:hidden',
		TONES[kind],
	]}>
	<button
		type="button"
		aria-label="open"
		class="absolute top-2.5 right-2.5 grid size-9 place-items-center rounded-md hover:bg-white/15"
		onclick={() => (dismissed = true)}>
		<i class="fa-solid fa-xmark fa-fw" aria-hidden="true"></i>
	</button>
	<i class={[ICONS[kind], 'fa-fw mt-1']} aria-hidden="true"></i>
	<p>
		{@render children()}
	</p>
</div>
