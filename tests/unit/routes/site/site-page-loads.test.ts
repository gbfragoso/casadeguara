import { describe, expect, it } from 'vitest';

import { expectHttpError, runHandler } from '../../support/handler-event';
import { load as loadDepartment } from '../../../../src/routes/(site)/departamentos/[departamento]/+page';
import { load as loadStudyMaterial } from '../../../../src/routes/(site)/material-de-estudo/[material]/+page';

describe('public page loads', () => {
	it('opens a known department page with its homepage summary', async () => {
		const { result } = await runHandler(loadDepartment, { params: { departamento: 'manjedoura' } });

		expect(result).toMatchObject({
			slug: 'manjedoura',
			conteudo: { titulo: 'Manjedoura Dr. Bezerra de Menezes' },
			resumo: 'Produz os enxovais entregues às gestantes do Recanto de Potira e aceita doação de roupas.',
		});
	});

	it('opens the Recanto de Potira page without a homepage summary', async () => {
		const { result } = await runHandler(loadDepartment, { params: { departamento: 'recanto' } });

		expect(result).toMatchObject({ slug: 'recanto', resumo: null });
	});

	it('answers 404 for an unknown department', async () => {
		const { error } = await expectHttpError(loadDepartment, { params: { departamento: 'x' } });

		expect(error.status).toBe(404);
	});

	it('opens a known study material page with its content', async () => {
		const { result } = await runHandler(loadStudyMaterial, { params: { material: 'curso-de-passes' } });

		expect(result).toMatchObject({ conteudo: { titulo: 'O Passe Espírita' } });
	});

	it('answers 404 for an unknown study material', async () => {
		const { error } = await expectHttpError(loadStudyMaterial, { params: { material: 'x' } });

		expect(error.status).toBe(404);
	});
});
