<script lang="ts">
	type Props = { icon: string; text: string };

	let { icon, text }: Props = $props();
</script>

<span class="flex items-center gap-1.5 text-sm font-medium text-ink-muted">
	<i class={[icon, 'fa-fw']} aria-hidden="true"></i>{text}
</span>
