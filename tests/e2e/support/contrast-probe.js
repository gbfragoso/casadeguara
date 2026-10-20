(() => {
	const FIELD_SELECTOR = 'input:not([type="hidden"]):not([type="range"]), select, textarea';
	const ICON_CONTROL_SELECTOR = 'button, a[href], [role="button"]';
	const OPAQUE = 1;
	const canvas = document.createElement('canvas');
	canvas.width = 1;
	canvas.height = 1;
	const context = canvas.getContext('2d', { willReadFrequently: true });
	if (!context) throw new Error('O navegador não oferece contexto 2D para a sonda de contraste.');

	/** @typedef {{ r: number, g: number, b: number, a: number }} Rgba */

	/** @param {string} color @returns {Rgba} */
	const toRgba = (color) => {
		context.clearRect(0, 0, 1, 1);
		context.fillStyle = 'transparent';
		context.fillStyle = color;
		context.fillRect(0, 0, 1, 1);
		const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
		return { r, g, b, a: a / 255 };
	};

	/** @param {Rgba} top @param {Rgba} bottom @returns {Rgba} */
	const blend = (top, bottom) => {
		/** @param {'r' | 'g' | 'b'} channel */
		const mix = (channel) => Math.round(top[channel] * top.a + bottom[channel] * (1 - top.a));
		return { r: mix('r'), g: mix('g'), b: mix('b'), a: OPAQUE };
	};

	/** @param {Rgba} color */
	const toHex = ({ r, g, b }) => `#${[r, g, b].map((value) => value.toString(16).padStart(2, '0')).join('')}`;

	/** @param {Element | null} element @returns {Rgba[] | null} */
	const layersBehind = (element) => {
		const layers = [];
		for (let node = element; node instanceof Element; node = node.parentElement) {
			const style = getComputedStyle(node);
			if (style.backgroundImage.includes('gradient')) return null;
			layers.push(toRgba(style.backgroundColor));
		}
		return layers;
	};

	/** @param {Element | null} element */
	const backgroundOf = (element) => {
		const layers = layersBehind(element);
		if (!layers) return null;
		return toHex(layers.reduceRight((bottom, top) => blend(top, bottom), toRgba('white')));
	};

	/** @param {Element} element */
	const isActive = (element) => {
		const rect = element.getBoundingClientRect();
		return rect.width > 0 && rect.height > 0 && !element.matches(':disabled');
	};

	/** @param {Element} element */
	const isNativeChoice = (element) =>
		element instanceof HTMLInputElement &&
		['checkbox', 'radio'].includes(element.type) &&
		getComputedStyle(element).appearance !== 'none';

	/** @param {Element} element */
	const describe = (element) => element.getAttribute('aria-label') ?? (element.id || element.tagName);

	/** @param {Element} field */
	const fieldPair = (field) => {
		const adjacent = backgroundOf(field.parentElement);
		const border = toHex(blend(toRgba(getComputedStyle(field).borderTopColor), toRgba(adjacent ?? 'white')));
		return { label: describe(field), adjacent, candidates: [border, backgroundOf(field)] };
	};

	/** @param {Element} control */
	const iconPair = (control) => {
		const icon = control.querySelector('i, svg');
		const color = icon ? toHex(toRgba(getComputedStyle(icon).color)) : null;
		return { label: describe(control), adjacent: backgroundOf(control), candidates: [color] };
	};

	/** @param {Element} control */
	const isIconOnly = (control) => control.textContent?.trim() === '' && control.querySelector('i, svg') !== null;

	/** @param {string} selector */
	const visibleControls = (selector) => [...document.querySelectorAll(selector)].filter(isActive);

	Object.assign(window, {
		__probeNonTextContrast: () => [
			...visibleControls(FIELD_SELECTOR)
				.filter((field) => !isNativeChoice(field))
				.map(fieldPair),
			...visibleControls(ICON_CONTROL_SELECTOR).filter(isIconOnly).map(iconPair),
		],
	});
})();
