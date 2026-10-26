<script lang="ts">
	type Props = { id: number; nome: string; temFoto: boolean; alt?: string };

	let { id, nome, temFoto, alt = `Foto de ${nome}` }: Props = $props();
</script>

{#if temFoto}
	<img
		src={`/comunicacao/palestrantes/${id}/foto/miniatura`}
		{alt}
		class="size-10 shrink-0 rounded-full border border-divider object-cover" />
{:else}
	<span
		aria-hidden="true"
		class="grid size-10 shrink-0 place-items-center rounded-full bg-surface-muted text-ink-muted">
		<i class="fa-solid fa-user"></i>
	</span>
{/if}
