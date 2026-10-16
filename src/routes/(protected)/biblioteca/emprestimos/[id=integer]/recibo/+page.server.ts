import { createBibliotecaEmprestimosIdIntegerReciboHandlers } from '#lib/server/biblioteca/emprestimos/id-recibo-handlers.js';
import { emprestimoModel } from '#lib/server/models/emprestimo.js';

import type { PageServerLoad } from './$types';

const handlers = createBibliotecaEmprestimosIdIntegerReciboHandlers({ model: emprestimoModel });
export const load: PageServerLoad = handlers.load;
