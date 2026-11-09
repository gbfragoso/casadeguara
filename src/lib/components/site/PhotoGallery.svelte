<script lang="ts">
	import type { PhotoGallery } from '#lib/site/photos.js';

	type Props = { gallery: PhotoGallery };

	let { gallery }: Props = $props();
	const headingId = $props.id();
</script>

<section aria-labelledby={headingId} class="mx-auto max-w-7xl px-4 pt-20 tablet:px-8 tablet:pt-28">
	<h2 id={headingId} class="font-display text-3xl font-extrabold text-balance text-ink-strong">{gallery.titulo}</h2>
	<ul class="mt-8 grid grid-cols-2 gap-3 tablet:grid-cols-3 tablet:gap-4 desktop:grid-cols-4">
		{#each gallery.fotos as photo (photo.src)}
			<li>
				<img
					src={photo.src}
					srcset={photo.srcset}
					sizes="(min-width: 64rem) 20rem, (min-width: 48.0625rem) 33vw, 50vw"
					width="640"
					height="480"
					loading="lazy"
					decoding="async"
					alt={photo.alt}
					class="aspect-4/3 w-full rounded-xl bg-sky object-cover" />
			</li>
		{/each}
	</ul>
</section>
