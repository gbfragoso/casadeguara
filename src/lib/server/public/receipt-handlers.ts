import type { RequestEvent } from '@sveltejs/kit';

import { lancamentoModel } from '#lib/server/tesouraria/lancamentos/index.js';
import { LancamentoError } from '#lib/server/tesouraria/lancamentos/errors.js';
import type { ReceiptState } from '#lib/server/tesouraria/lancamentos/types.js';
import { error } from '@sveltejs/kit';

const load = async ({ params }: RequestEvent) => {
	let receipt: ReceiptState | null = null;
	try {
		receipt = await lancamentoModel.getReceipt(String(params.uuid));
	} catch (cause) {
		if (cause instanceof LancamentoError && cause.code === 'VALIDATION_ERROR') {
			error(400, cause.message);
		}
		console.error('treasury.launches.receipt_lookup_failed');
		error(500, 'Falha ao carregar o recibo.');
	}
	if (!receipt) error(404, 'Recibo inexistente');
	return receipt;
};

export const createReceiptHandlers = () => ({
	load,
});
