import { createBibliotecaEmprestimosIdIntegerReciboHandlers } from '$lib/server/biblioteca/emprestimos/id-recibo-handlers';

import type { PageServerLoad } from './$types';

const handlers = createBibliotecaEmprestimosIdIntegerReciboHandlers();
export const load: PageServerLoad = handlers.load;
