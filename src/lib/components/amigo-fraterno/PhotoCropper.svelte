<script lang="ts">
	import { PHOTO_FRAME } from '$lib/amigo-fraterno/card-geometry';
	import { createCropRectangle, type ImageSize, type PhotoPositionInput } from '$lib/amigo-fraterno/photo-crop';

	interface Props {
		src: string;
		alt?: string;
		initialPosition?: Partial<PhotoPositionInput>;
		disabled?: boolean;
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
		if (disabled || (event.pointerType === 'mouse' && event.button !== 0)) return;
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
		const bounds = frameElement.getBoundingClientRect();
		const deltaX = event.clientX - lastPointerX;
		const deltaY = event.clientY - lastPointerY;
		lastPointerX = event.clientX;
		lastPointerY = event.clientY;
		setPosition(focalX - deltaX / bounds.width / zoom, focalY - deltaY / bounds.height / zoom);
	}

	function handlePointerup(event: PointerEvent) {
		if (event.pointerId !== pointerId) return;
		dragging = false;
		pointerId = undefined;
		try {
			frameElement?.releasePointerCapture(event.pointerId);
		} catch (error) {
			if (!(error instanceof DOMException && error.name === 'NotFoundError')) throw error;
		}
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
		const frameAspectRatio = PHOTO_FRAME.outputWidth / PHOTO_FRAME.outputHeight;
		const crop = createCropRectangle(sourceSize, { focalX, focalY, zoom }, frameAspectRatio);
		return `width: ${(sourceSize.width / crop.width) * 100}%; height: ${(sourceSize.height / crop.height) * 100}%; left: ${(-crop.left / crop.width) * 100}%; top: ${(-crop.top / crop.height) * 100}%;`;
	}

	let imageStyle = $derived(createImageStyle());
</script>

<div class="photo-cropper" data-testid="photo-cropper">
	<p class="help" id="photo-cropper-instructions">
		Use as setas do teclado ou arraste a imagem para escolher a área que aparecerá no cartão.
	</p>
	<div
		class="photo-cropper__frame"
		role="button"
		tabindex="0"
		aria-label="Área de enquadramento da foto"
		aria-describedby="photo-cropper-instructions"
		aria-busy={disabled}
		bind:this={frameElement}
		onkeydown={handleKeydown}
		onpointerdown={handlePointerdown}
		onpointermove={handlePointermove}
		onpointerup={handlePointerup}
		onpointercancel={handlePointerup}>
		<img class="photo-cropper__image" {src} {alt} draggable="false" onload={handleImageLoad} style={imageStyle} />
		<div class="photo-cropper__mask" aria-hidden="true"></div>
	</div>
	<label class="label mt-3" for="photo-cropper-zoom">
		Ampliação <output for="photo-cropper-zoom">{zoom.toFixed(2)}×</output>
	</label>
	<input
		class="photo-cropper__zoom"
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
	<div class="buttons mt-3">
		<button class="button is-light" type="button" {disabled} onclick={resetPosition}>
			Redefinir enquadramento
		</button>
		{#if onCancel}
			<button class="button is-light" type="button" {disabled} onclick={onCancel}>Cancelar</button>
		{/if}
		<button class="button is-primary" type="submit" {disabled}>Confirmar enquadramento</button>
	</div>
</div>

<style>
	.photo-cropper__frame {
		position: relative;
		width: min(100%, 18rem);
		aspect-ratio: 239 / 300;
		overflow: hidden;
		background: hsl(0deg 0% 92%);
		cursor: grab;
		touch-action: none;
		outline: 2px solid transparent;
	}

	.photo-cropper__frame:focus-visible {
		outline-color: hsl(171deg 100% 41%);
		outline-offset: 3px;
	}

	.photo-cropper__frame:active {
		cursor: grabbing;
	}

	.photo-cropper__image {
		position: absolute;
		display: block;
		max-width: none;
		max-height: none;
		object-fit: cover;
		user-select: none;
	}

	.photo-cropper__mask {
		position: absolute;
		inset: 0;
		border: 2px solid hsl(0deg 0% 100% / 85%);
		box-shadow: 0 0 0 999px hsl(0deg 0% 0% / 12%);
		pointer-events: none;
	}

	.photo-cropper__zoom {
		width: min(100%, 18rem);
	}
</style>
