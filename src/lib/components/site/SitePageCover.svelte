<script lang="ts">
	import type { SitePhoto } from '#lib/site/photos.js';

	type Props = { photo: SitePhoto };

	let { photo }: Props = $props();
</script>

<img
	src={photo.src}
	srcset={photo.srcset}
	sizes="(min-width: 80rem) 76rem, calc(100vw - 4rem)"
	width="1600"
	height="400"
	alt={photo.alt}
	class="aspect-4/1 w-full rounded-2xl bg-sky object-cover tablet:rounded-3xl" />
