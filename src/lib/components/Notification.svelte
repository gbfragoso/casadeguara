<script lang="ts">
	interface Props {
		class: string;
		children?: import('svelte').Snippet;
	}

	let { class: clazz = '', children }: Props = $props();
	let open = $state(false);
</script>

<div
	class="notification {clazz}"
	style="position:fixed; bottom: 10px; right: 10px; max-width: 500px; {open === true ? 'display:none' : ''}">
	<button aria-label="open" class="delete" onclick={() => (open = !open)}></button>
	<p class="p-2">
		{@render children?.()}
	</p>
</div>
