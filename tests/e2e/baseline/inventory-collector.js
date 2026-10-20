(() => {
	const REGION_PREFIX = 'regiao-';
	const SKIPPED_TAGS = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT']);
	const IMAGE_TAGS = new Set(['IMG', 'CANVAS']);
	const LABEL_ATTRIBUTES = new Set(['aria-label', 'aria-labelledby']);
	const CONTROL_ROLES = new Set([
		'button',
		'link',
		'checkbox',
		'radio',
		'switch',
		'tab',
		'menuitem',
		'option',
		'combobox',
		'textbox',
		'searchbox',
		'slider',
		'spinbutton',
	]);
	const INPUT_ROLES = {
		button: 'button',
		checkbox: 'checkbox',
		image: 'button',
		number: 'spinbutton',
		radio: 'radio',
		range: 'slider',
		reset: 'button',
		search: 'searchbox',
		submit: 'button',
	};
	const BUTTON_INPUT_TYPES = new Set(['button', 'reset', 'submit']);
	const MONTHS = 'janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro';
	// Datas DD/MM/AAAA, referências "<mês> / AAAA" e referências MM/AAAA, nesta ordem.
	const DATE_PATTERNS = [
		/\b\d{2}\/\d{2}\/\d{4}\b/g,
		new RegExp(`(?:${MONTHS})\\s*\\/\\s*\\d{4}\\b`, 'giu'),
		/\b\d{2}\/\d{4}\b/g,
	];

	/** @param {string | null | undefined} value */
	const normalize = (value) => {
		if (value === null || value === undefined) return null;
		const collapsed = value.replace(/\s+/g, ' ').trim();
		const text = DATE_PATTERNS.reduce((current, pattern) => current.replace(pattern, '<data>'), collapsed);
		return text === '' ? null : text;
	};

	/** @param {Element} element */
	const isVisible = (element) => element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });

	/** @param {Element} element */
	const isNotRendered = (element) => getComputedStyle(element).display === 'none';

	/** @param {Element} element */
	const regionOf = (element) => {
		const marker = element.closest(`[data-testid^="${REGION_PREFIX}"]`);
		return marker?.getAttribute('data-testid')?.slice(REGION_PREFIX.length) ?? 'conteudo';
	};

	/** @param {Element} element @returns {string | null} */
	const implicitRole = (element) => {
		if (element instanceof HTMLAnchorElement) return element.hasAttribute('href') ? 'link' : null;
		if (element instanceof HTMLButtonElement || element.tagName === 'SUMMARY') return 'button';
		if (element instanceof HTMLSelectElement) return element.multiple || element.size > 1 ? 'listbox' : 'combobox';
		if (element instanceof HTMLTextAreaElement) return 'textbox';
		if (element instanceof HTMLImageElement) return 'img';
		if (!(element instanceof HTMLInputElement) || element.type === 'hidden') return null;
		return Object.entries(INPUT_ROLES).find(([type]) => type === element.type)?.[1] ?? 'textbox';
	};

	/** @param {Element} element */
	const roleOf = (element) => element.getAttribute('role') ?? implicitRole(element);

	/** @param {Element} element */
	const isControl = (element) => element instanceof HTMLSelectElement || CONTROL_ROLES.has(roleOf(element) ?? '');

	/** @param {Element} element */
	const labelTextOf = (element) => {
		const labelledBy = element.getAttribute('aria-labelledby');
		if (labelledBy) {
			const texts = labelledBy.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? '');
			return normalize(texts.join(' '));
		}
		const labels = 'labels' in element && element.labels instanceof NodeList ? [...element.labels] : [];
		return normalize(labels.map((label) => label.textContent).join(' '));
	};

	/** @param {Element} element */
	const labelsOf = (element) => ({
		ariaLabel: normalize(element.getAttribute('aria-label')),
		title: normalize(element.getAttribute('title')),
		alt: normalize(element.getAttribute('alt')),
		placeholder: normalize(element.getAttribute('placeholder')),
		labelText: labelTextOf(element),
	});

	/** @param {Element} element @returns {Record<string, string>} */
	const propertyStatesOf = (element) => {
		if (element instanceof HTMLInputElement) {
			const checkable = element.type === 'checkbox' || element.type === 'radio';
			return {
				disabled: String(element.disabled),
				required: String(element.required),
				readonly: String(element.readOnly),
				...(checkable ? { checked: String(element.checked) } : {}),
				...(element.type === 'file' ? { multiple: String(element.multiple) } : {}),
			};
		}
		if (element instanceof HTMLSelectElement) {
			const { disabled, required, multiple } = element;
			return { disabled: String(disabled), required: String(required), multiple: String(multiple) };
		}
		if (element instanceof HTMLTextAreaElement) {
			return {
				disabled: String(element.disabled),
				required: String(element.required),
				readonly: String(element.readOnly),
			};
		}
		return element instanceof HTMLButtonElement ? { disabled: String(element.disabled) } : {};
	};

	/** @param {Element} element */
	const statesOf = (element) => {
		const ariaStates = [...element.attributes]
			.filter((attribute) => attribute.name.startsWith('aria-') && !LABEL_ATTRIBUTES.has(attribute.name))
			.map((attribute) => [attribute.name, attribute.value]);
		return { ...Object.fromEntries(ariaStates), ...propertyStatesOf(element) };
	};

	/** @param {Element} element */
	const controlTextOf = (element) => {
		if (element instanceof HTMLInputElement)
			return BUTTON_INPUT_TYPES.has(element.type) ? normalize(element.value) : null;
		if (element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) return null;
		return normalize(element.textContent);
	};

	/** @param {Element} element @param {string} kind @param {string | null} text */
	const createEntry = (element, kind, text) => ({
		region: regionOf(element),
		kind,
		text,
		textTransform: null,
		role: roleOf(element),
		labels: labelsOf(element),
		states: kind === 'controle' ? statesOf(element) : {},
		options:
			element instanceof HTMLSelectElement ? [...element.options].map((option) => normalize(option.text)) : null,
	});

	/** @param {Element} element */
	const describeElement = (element) => {
		if (!isVisible(element)) return null;
		if (isControl(element)) return createEntry(element, 'controle', controlTextOf(element));
		if (IMAGE_TAGS.has(element.tagName) || element.getAttribute('role') === 'img') {
			return createEntry(element, 'imagem', null);
		}
		const labelled = element.hasAttribute('aria-label') || element.hasAttribute('title');
		return labelled ? createEntry(element, 'rotulo', null) : null;
	};

	/** @param {Text} node */
	const describeText = (node) => {
		const parent = node.parentElement;
		const text = normalize(node.textContent);
		if (!parent || !text || !isVisible(parent)) return null;
		const transform = getComputedStyle(parent).textTransform;
		return {
			region: regionOf(parent),
			kind: 'texto',
			text,
			textTransform: transform === 'none' ? null : transform,
			role: null,
			labels: { ariaLabel: null, title: null, alt: null, placeholder: null, labelText: null },
			states: {},
			options: null,
		};
	};

	/** @param {Node} node @param {object[]} entries */
	const visit = (node, entries) => {
		if (node instanceof Text) {
			const entry = describeText(node);
			if (entry) entries.push(entry);
			return;
		}
		if (!(node instanceof Element) || SKIPPED_TAGS.has(node.tagName) || isNotRendered(node)) return;
		const entry = describeElement(node);
		if (entry) entries.push(entry);
		if (isControl(node)) return;
		node.childNodes.forEach((child) => visit(child, entries));
	};

	Object.defineProperty(window, '__baselineInventory', {
		value: {
			collect: () => {
				/** @type {object[]} */
				const entries = [];
				visit(document.body, entries);
				return entries;
			},
		},
	});
})();
