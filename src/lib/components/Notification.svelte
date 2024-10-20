<script>
	let clazz = '';
	export { clazz as class };
	let open = false;
</script>

<div
	class="notification {clazz}"
	style="position:fixed; bottom: 10px; right: 10px; max-width: 500px; {open === true ? 'display:none' : ''}">
	<button aria-label="open" class="delete" on:click={() => (open = !open)}></button>
	<p class="p-2">
		<slot></slot>
	</p>
</div>
