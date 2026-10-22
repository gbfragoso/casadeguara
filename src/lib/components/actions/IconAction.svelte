<script lang="ts">
	import type { ClassValue, HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	type IconActionTone = 'default' | 'danger';
	type IconActionStyle = {
		icon: string;
		'aria-label': string;
		tone?: IconActionTone;
		class?: ClassValue;
	};
	type Props = IconActionStyle &
		(
			| (Omit<HTMLButtonAttributes, 'class' | 'children'> & { href?: undefined })
			| (Omit<HTMLAnchorAttributes, 'class' | 'children'> & { href: string })
		);

	const BASE =
		'inline-grid size-9 shrink-0 place-items-center rounded-md transition-colors hover:no-underline disabled:cursor-not-allowed disabled:opacity-55 motion-reduce:transition-none';

	const TONES: Record<IconActionTone, string> = {
		default: 'text-ink-muted hover:bg-surface-muted hover:text-primary-ink',
		danger: 'text-danger-ink hover:bg-danger-soft',
	};

	let { icon, tone = 'default', class: className, ...rest }: Props = $props();

	let classes = $derived([BASE, TONES[tone], className]);
</script>

{#if rest.href !== undefined}
	<a {...rest} class={classes}><i class={[icon, 'fa-fw']} aria-hidden="true"></i></a>
{:else}
	<button type="button" {...rest} class={classes}><i class={[icon, 'fa-fw']} aria-hidden="true"></i></button>
{/if}
