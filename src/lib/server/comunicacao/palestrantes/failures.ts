import { error } from '@sveltejs/kit';

export const missingSpeaker = (): never => error(404, 'Palestrante não encontrado.');

export const failSpeakerOperation = (operacao: string, palestranteId: number, cause: unknown): never => {
	console.error('comunicacao.palestrantes.falha', { operacao, palestranteId, error: cause });
	error(500, 'Falha ao processar o palestrante.');
};

export const runSpeakerOperation = async <T>(operacao: string, palestranteId: number, run: () => Promise<T>) => {
	try {
		return await run();
	} catch (cause) {
		return failSpeakerOperation(operacao, palestranteId, cause);
	}
};
