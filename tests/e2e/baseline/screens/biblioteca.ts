import { expect } from '@playwright/test';

import type { RepresentativeScreen } from '../types';
import {
	advancePasswordStrength,
	deleteDisposableBook,
	openDeleteDialog,
	openReaderSuggestions,
	openSidebar,
	openUserMenu,
	searchBooksByTitle,
} from './biblioteca-actions';

const SIDEBAR_TOGGLE_WIDTHS = [390, 820];

export const BIBLIOTECA_SCREENS: readonly RepresentativeScreen[] = [
	{
		id: 'biblioteca-inicio',
		role: 'admin',
		shell: true,
		path: () => '/biblioteca',
		states: [{ id: 'inicial', prepare: (page) => expect(page.getByText('Mural de avisos')).toBeVisible() }],
	},
	{
		id: 'livros',
		role: 'admin',
		shell: true,
		print: true,
		path: () => '/biblioteca/livros',
		states: [
			{ id: 'resultados', prepare: searchBooksByTitle },
			{ id: 'notificacao', print: false, extraRegions: ['notificacao'], prepare: deleteDisposableBook },
			{ id: 'modal', print: false, prepare: openDeleteDialog },
		],
	},
	{
		id: 'livro-cadastro',
		role: 'admin',
		shell: true,
		path: () => '/biblioteca/livros/novo',
		states: [{ id: 'inicial', prepare: (page) => expect(page.getByLabel('Tombo')).toBeVisible() }],
	},
	{
		id: 'livro-exemplares',
		role: 'admin',
		shell: true,
		path: (seed) => `/biblioteca/livros/${seed.bookWithCopiesId}/exemplares`,
		states: [
			{ id: 'inicial', prepare: (page) => expect(page.getByText('Arquivado', { exact: true })).toBeVisible() },
		],
	},
	{
		id: 'emprestimo-novo',
		role: 'admin',
		shell: true,
		path: () => '/biblioteca/emprestimos/novo',
		states: [{ id: 'autocompletar', prepare: openReaderSuggestions }],
	},
	{
		id: 'usuario-novo',
		role: 'admin',
		shell: true,
		path: () => '/biblioteca/usuarios/novo',
		states: [{ id: 'progresso', prepare: advancePasswordStrength }],
	},
	{
		id: 'recibo-termico',
		role: 'admin',
		shell: true,
		print: true,
		path: (seed) => `/biblioteca/emprestimos/${seed.loanReceiptId}/recibo`,
		states: [
			{
				id: 'inicial',
				prepare: (page) => expect(page.getByRole('button', { name: 'Imprimir recibo' })).toBeVisible(),
			},
		],
	},
	{
		id: 'menus-abertos',
		role: 'admin',
		shell: true,
		path: () => '/biblioteca',
		states: [
			{ id: 'menu-usuario', prepare: openUserMenu },
			{ id: 'menu-lateral', widths: SIDEBAR_TOGGLE_WIDTHS, extraRegions: ['menu-lateral'], prepare: openSidebar },
		],
	},
];
