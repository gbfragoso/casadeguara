<script lang="ts">
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import type { Snippet } from 'svelte';

	type Props = { children: Snippet };

	let { children }: Props = $props();
</script>

{@render children()}
