<script lang="ts">
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import '../app.scss';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

{@render children?.()}
