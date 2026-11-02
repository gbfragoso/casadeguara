// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import { readFormSearchParams } from '#lib/forms/search-params.js';

const createForm = (html: string) => {
	const form = document.createElement('form');
	form.innerHTML = html;
	return form;
};

describe('readFormSearchParams', () => {
	it('keeps every text value, including repeated names, in form order', () => {
		const form = createForm(
			'<input name="titulo" value="Lista"><input type="checkbox" name="dias" value="1" checked>' +
				'<input type="checkbox" name="dias" value="3"><input type="checkbox" name="dias" value="4" checked>',
		);

		const params = readFormSearchParams(form);

		expect(params.toString()).toBe('titulo=Lista&dias=1&dias=4');
	});

	it('leaves file fields out', () => {
		const form = createForm('<input name="titulo" value="Lista"><input type="file" name="anexo">');

		const params = readFormSearchParams(form);

		expect([...params.keys()]).toEqual(['titulo']);
	});
});
