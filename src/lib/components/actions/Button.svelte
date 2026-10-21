<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	type ButtonTone = 'default' | 'primary' | 'warning' | 'danger' | 'success' | 'light' | 'ghost' | 'link';
	type ButtonSize = 'small' | 'normal';
	type ButtonStyle = {
		tone?: ButtonTone;
		size?: ButtonSize;
		fullwidth?: boolean;
		bold?: boolean;
		rounded?: boolean;
		loading?: boolean;
		class?: ClassValue;
		children: Snippet;
	};
	type Props = ButtonStyle &
		(
			| (Omit<HTMLButtonAttributes, 'class' | 'children'> & { href?: undefined })
			| (Omit<HTMLAnchorAttributes, 'class' | 'children'> & { href: string })
		);

	const BASE =
		'relative inline-flex items-center justify-center gap-2 rounded-md transition-colors motion-reduce:transition-none disabled:cursor-not-allowed disabled:not-aria-busy:opacity-55 aria-busy:text-transparent';

	const TONES: Record<ButtonTone, string> = {
		default: 'border border-line bg-surface text-ink-strong hover:bg-surface-muted',
		primary: 'bg-primary-600 text-on-primary hover:bg-primary-700',
		warning: 'bg-accent text-on-accent hover:bg-accent-400',
		danger: 'bg-danger text-on-danger hover:bg-danger-700',
		success: 'bg-success text-on-success hover:bg-success-700',
		light: 'bg-surface-muted text-ink-strong hover:bg-divider',
		ghost: 'text-ink-strong hover:bg-surface-muted',
		link: 'text-primary-ink underline-offset-4 hover:underline',
	};

	const SPINNER_TONES: Record<ButtonTone, string> = {
		default: 'text-ink-strong',
		primary: 'text-on-primary',
		warning: 'text-on-accent',
		danger: 'text-on-danger',
		success: 'text-on-success',
		light: 'text-ink-strong',
		ghost: 'text-ink-strong',
		link: 'text-primary-ink',
	};

	const SIZES: Record<ButtonSize, string> = {
		normal: 'min-h-10 px-4 text-base',
		small: 'min-h-8 px-3 text-sm',
	};

	let {
		tone = 'default',
		size = 'normal',
		fullwidth = false,
		bold = false,
		rounded = false,
		loading,
		class: className,
		children,
		...rest
	}: Props = $props();

	let classes = $derived([
		BASE,
		TONES[tone],
		SIZES[size],
		fullwidth ? 'w-full' : 'w-full tablet:w-auto',
		bold ? 'font-bold' : 'font-medium',
		rounded && 'rounded-full',
		className,
	]);
</script>

{#if rest.href !== undefined}
	<a {...rest} class={classes}>{@render children()}</a>
{:else}
	<button {...rest} class={classes} aria-busy={loading} disabled={loading || rest.disabled}>
		{@render children()}
		{#if loading}
			<span
				aria-hidden="true"
				class={[
					'absolute inset-0 m-auto size-4 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none',
					SPINNER_TONES[tone],
				]}></span>
		{/if}
	</button>
{/if}
