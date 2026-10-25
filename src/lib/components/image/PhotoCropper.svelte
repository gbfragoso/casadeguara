<script lang="ts">
	import Button from '#lib/components/actions/Button.svelte';
	import ButtonGroup from '#lib/components/actions/ButtonGroup.svelte';
	import { PHOTO_FRAME } from '#lib/image/geometry/card.js';
	import { createCropRectangle, type ImageSize, type PhotoPositionInput } from '#lib/image/crop/rectangle.js';

	interface Props {
		src: string;
		alt?: string;
		initialPosition?: Partial<PhotoPositionInput>;
		disabled?: boolean;
		aspectRatio?: number;
		instructions?: string;
		onCancel?: () => void;
		onPositionChange?: (position: PhotoPositionInput) => void;
	}

	const POSITION_STEP = 0.02;
	const MINIMUM_ZOOM = 1;
	const MAXIMUM_ZOOM = 3;

	let {
		src,
		alt = 'Prévia da foto',
		initialPosition = {},
		disabled = false,
		aspectRatio = PHOTO_FRAME.outputWidth / PHOTO_FRAME.outputHeight,
		instructions = 'Use as setas do teclado ou arraste a imagem para escolher a área que aparecerá no cartão.',
		onCancel,
		onPositionChange,
	}: Props = $props();
	function createInitialValues() {
		return {
			focalX: clamp(initialPosition.focalX ?? 0.5, 0, 1),
			focalY: clamp(initialPosition.focalY ?? 0.5, 0, 1),
			zoom: clamp(initialPosition.zoom ?? MINIMUM_ZOOM, MINIMUM_ZOOM, MAXIMUM_ZOOM),
		};
	}

	const initialValues = createInitialValues();
	let focalX = $state(initialValues.focalX);
	let focalY = $state(initialValues.focalY);
	let zoom = $state(initialValues.zoom);
	let frameElement: HTMLDivElement | undefined;
	let sourceSize = $state<ImageSize | null>(null);
	let dragging = false;
	let pointerId: number | undefined;
	let lastPointerX = 0;
	let lastPointerY = 0;

	function clamp(value: number, minimum: number, maximum: number) {
		return Math.min(maximum, Math.max(minimum, value));
	}

	function notifyPosition() {
		onPositionChange?.({ focalX, focalY, zoom });
	}

	function setPosition(nextFocalX: number, nextFocalY: number, nextZoom = zoom) {
		focalX = clamp(nextFocalX, 0, 1);
		focalY = clamp(nextFocalY, 0, 1);
		zoom = clamp(nextZoom, MINIMUM_ZOOM, MAXIMUM_ZOOM);
		notifyPosition();
	}

	function resetPosition() {
		setPosition(0.5, 0.5, MINIMUM_ZOOM);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (disabled) return;
		const movement = {
			ArrowLeft: [-POSITION_STEP, 0],
			ArrowRight: [POSITION_STEP, 0],
			ArrowUp: [0, -POSITION_STEP],
			ArrowDown: [0, POSITION_STEP],
		}[event.key];
		if (!movement) return;
		event.preventDefault();
		setPosition(focalX + movement[0], focalY + movement[1]);
	}

	function handlePointerdown(event: PointerEvent) {
		if (disabled || dragging || (event.pointerType === 'mouse' && event.button !== 0)) return;
		dragging = true;
		pointerId = event.pointerId;
		lastPointerX = event.clientX;
		lastPointerY = event.clientY;
		try {
			frameElement?.setPointerCapture(event.pointerId);
		} catch (error) {
			if (!(error instanceof DOMException && error.name === 'NotFoundError')) throw error;
		}
	}

	function handlePointermove(event: PointerEvent) {
		if (!dragging || event.pointerId !== pointerId || !frameElement) return;
		if (event.pointerType === 'mouse' && event.buttons === 0) {
			endDrag();
			return;
		}
		const bounds = frameElement.getBoundingClientRect();
		const deltaX = event.clientX - lastPointerX;
		const deltaY = event.clientY - lastPointerY;
		lastPointerX = event.clientX;
		lastPointerY = event.clientY;
		setPosition(focalX - deltaX / bounds.width / zoom, focalY - deltaY / bounds.height / zoom);
	}

	function endDrag() {
		if (pointerId === undefined) return;
		const releasedPointerId = pointerId;
		dragging = false;
		pointerId = undefined;
		try {
			frameElement?.releasePointerCapture(releasedPointerId);
		} catch (error) {
			if (!(error instanceof DOMException && error.name === 'NotFoundError')) throw error;
		}
	}

	function handlePointerup(event: PointerEvent) {
		if (event.pointerId === pointerId) endDrag();
	}

	function handleZoomInput(event: Event) {
		if (!(event.target instanceof HTMLInputElement)) return;
		setPosition(focalX, focalY, Number(event.target.value));
	}

	function handleImageLoad(event: Event) {
		if (!(event.target instanceof HTMLImageElement)) return;
		sourceSize = { width: event.target.naturalWidth, height: event.target.naturalHeight };
	}

	function createImageStyle() {
		if (!sourceSize) return `object-position: ${focalX * 100}% ${focalY * 100}%; transform: scale(${zoom});`;
		const crop = createCropRectangle(sourceSize, { focalX, focalY, zoom }, aspectRatio);
		return `width: ${(sourceSize.width / crop.width) * 100}%; height: ${(sourceSize.height / crop.height) * 100}%; left: ${(-crop.left / crop.width) * 100}%; top: ${(-crop.top / crop.height) * 100}%;`;
	}

	let imageStyle = $derived(createImageStyle());
</script>

<svelte:window onblur={endDrag} />

<div data-testid="photo-cropper">
	<p class="text-sm text-ink-muted" id="photo-cropper-instructions">{instructions}</p>
	<div
		class="relative mt-2 w-full max-w-72 cursor-grab touch-none overflow-hidden rounded-md bg-surface-muted focus-visible:outline-offset-3 active:cursor-grabbing"
		role="button"
		tabindex="0"
		aria-label="Área de enquadramento da foto"
		aria-describedby="photo-cropper-instructions"
		aria-busy={disabled}
		style:aspect-ratio={aspectRatio}
		bind:this={frameElement}
		onkeydown={handleKeydown}
		onpointerdown={handlePointerdown}
		onpointermove={handlePointermove}
		onpointerup={handlePointerup}
		onpointercancel={handlePointerup}
		onlostpointercapture={handlePointerup}>
		<img
			class="absolute block max-h-none max-w-none object-cover select-none"
			{src}
			{alt}
			draggable="false"
			onload={handleImageLoad}
			style={imageStyle} />
		<div class="photo-cropper-mask pointer-events-none absolute inset-0" aria-hidden="true"></div>
	</div>
	<label class="mt-3 block text-sm font-medium text-ink-strong" for="photo-cropper-zoom">
		Ampliação <output for="photo-cropper-zoom">{zoom.toFixed(2)}×</output>
	</label>
	<input
		class="mt-1 w-full max-w-72"
		id="photo-cropper-zoom"
		type="range"
		min={MINIMUM_ZOOM}
		max={MAXIMUM_ZOOM}
		step="0.01"
		value={zoom}
		aria-label="Ampliação da foto"
		{disabled}
		oninput={handleZoomInput} />
	<input type="hidden" name="focalX" value={focalX} />
	<input type="hidden" name="focalY" value={focalY} />
	<input type="hidden" name="zoom" value={zoom} />
	<ButtonGroup class="mt-3">
		<Button tone="light" type="button" {disabled} onclick={resetPosition}>Redefinir enquadramento</Button>
		{#if onCancel}
			<Button tone="light" type="button" {disabled} onclick={onCancel}>Cancelar</Button>
		{/if}
		<Button tone="primary" type="submit" {disabled}>Confirmar enquadramento</Button>
	</ButtonGroup>
</div>

<style>
	.photo-cropper-mask {
		border: 2px solid color-mix(in srgb, var(--color-white) 85%, transparent);
		box-shadow: 0 0 0 999px color-mix(in srgb, var(--color-black) 12%, transparent);
	}
</style>
