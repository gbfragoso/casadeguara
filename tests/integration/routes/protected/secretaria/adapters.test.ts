import { describe, expect, it } from 'vitest';

import {
	actions as cadastroActions,
	load as cadastroLoad,
} from '../../../../../src/routes/(protected)/secretaria/cadastros/+page.server';
import { actions as newCadastroActions } from '../../../../../src/routes/(protected)/secretaria/cadastros/novo/+page.server';
import {
	actions as editCadastroActions,
	load as editCadastroLoad,
} from '../../../../../src/routes/(protected)/secretaria/cadastros/[id=integer]/+page.server';
import { load as amigoLoad } from '../../../../../src/routes/(protected)/secretaria/amigofraterno/+page.server';
import { createRequestEvent, invoke } from '../../../support/request-event';

const event = () =>
	createRequestEvent({ request: new Request('http://localhost/', { method: 'POST', body: new FormData() }) });
const invokeSafely = <Result>(handler: (...args: never[]) => Result) =>
	Promise.resolve().then(() => invoke(handler, event()));
const loads = [cadastroLoad, editCadastroLoad, amigoLoad];
const actions = [cadastroActions.default, newCadastroActions.default, editCadastroActions.salvarCadastro];

describe('TI-06 secretaria route exports', () => {
	it('rejects anonymous loads at each protected boundary', async () => {
		await Promise.all(loads.map((load) => expect(invokeSafely(load)).rejects.toMatchObject({ status: 302 })));
	});

	it('rejects anonymous actions before validation or persistence', async () => {
		await Promise.all(actions.map((action) => expect(invokeSafely(action)).rejects.toMatchObject({ status: 302 })));
	});
});
