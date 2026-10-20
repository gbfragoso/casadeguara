import { fixedPath, type CatalogRoute } from './types';

export const ACCESS_ROUTES: readonly CatalogRoute[] = [
	{ id: 'login', route: '/', role: 'public', shell: false, path: fixedPath('/') },
	{ id: 'sistemas', route: '/(protected)/sistemas', role: 'admin', shell: false, path: fixedPath('/sistemas') },
	{
		id: 'meu-cadastro',
		route: '/(protected)/usuario/[id=alphanumeric]',
		role: 'admin',
		shell: false,
		path: ({ contaPropria }) => `/usuario/${contaPropria}`,
	},
	{ id: 'acervo', route: '/acervo', role: 'public', shell: false, path: fixedPath('/acervo') },
	{
		id: 'recibo',
		route: '/recibo/[uuid=uuid]',
		role: 'public',
		shell: false,
		path: ({ recibo }) => `/recibo/${recibo}`,
	},
];
