import { describe, expect, it } from 'vitest';

import { appendPrintRequest, fulfillPrintRequest, hasPrintRequest } from '#lib/printing/print-request.js';

const receiptUrl = (search = '') => new URL(`http://localhost/biblioteca/emprestimos/7/recibo${search}`);

const recordPrintSteps = () => {
	const calls: string[] = [];
	return {
		calls,
		steps: {
			clearRequest: async () => {
				await Promise.resolve();
				calls.push('clearRequest');
			},
			print: () => {
				calls.push('print');
			},
		},
	};
};

describe('appendPrintRequest', () => {
	it('appends the print request to the receipt path', () => {
		const path = '/biblioteca/emprestimos/7/recibo';

		const requestedPath = appendPrintRequest(path);

		expect(requestedPath).toBe('/biblioteca/emprestimos/7/recibo?imprimir=1');
	});
});

describe('hasPrintRequest', () => {
	it.each(['?imprimir=1', '?imprimir=0', '?imprimir', '?pagina=2&imprimir=1'])(
		'recognizes the print request in %s',
		(search) => {
			const url = receiptUrl(search);

			const requested = hasPrintRequest(url);

			expect(requested).toBe(true);
		},
	);

	it.each(['', '?pagina=2', '?imprimirx=1'])('ignores a URL without the print request: "%s"', (search) => {
		const url = receiptUrl(search);

		const requested = hasPrintRequest(url);

		expect(requested).toBe(false);
	});
});

describe('fulfillPrintRequest', () => {
	it('ignores a navigation without a print request', async () => {
		const { calls, steps } = recordPrintSteps();

		const fulfilled = await fulfillPrintRequest(receiptUrl(), steps);

		expect(fulfilled).toBe(false);
		expect(calls).toEqual([]);
	});

	it('clears the print request before printing once', async () => {
		const { calls, steps } = recordPrintSteps();

		const fulfilled = await fulfillPrintRequest(receiptUrl('?imprimir=1'), steps);

		expect(fulfilled).toBe(true);
		expect(calls).toEqual(['clearRequest', 'print']);
	});

	it('does not print when the print request cannot be cleared', async () => {
		const { calls, steps } = recordPrintSteps();
		const failure = new Error('navigation aborted');

		const fulfillment = fulfillPrintRequest(receiptUrl('?imprimir=1'), {
			...steps,
			clearRequest: () => Promise.reject(failure),
		});

		await expect(fulfillment).rejects.toBe(failure);
		expect(calls).toEqual([]);
	});
});
